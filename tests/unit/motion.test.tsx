import { render,waitFor } from "@testing-library/react";
import { beforeEach,describe,expect,it,vi } from "vitest";
const lenisConstructor=vi.fn();const destroy=vi.fn();
vi.mock("lenis",()=>({default:class{constructor(){lenisConstructor();}raf(){}destroy(){destroy();}}}));
import { PublicSmoothScroll } from "@/components/motion/public-smooth-scroll";
describe("reduced motion",()=>{beforeEach(()=>{lenisConstructor.mockClear();destroy.mockClear();});it("does not initialize forced smooth scrolling when reduced motion is requested",async()=>{vi.mocked(window.matchMedia).mockReturnValue({...window.matchMedia(""),matches:true});render(<PublicSmoothScroll><main>Content</main></PublicSmoothScroll>);await waitFor(()=>expect(lenisConstructor).not.toHaveBeenCalled());});it("limits Lenis to its mounted public wrapper and cleans it up",async()=>{vi.mocked(window.matchMedia).mockReturnValue({...window.matchMedia(""),matches:false});const view=render(<PublicSmoothScroll><main>Content</main></PublicSmoothScroll>);await waitFor(()=>expect(lenisConstructor).toHaveBeenCalledOnce());view.unmount();expect(destroy).toHaveBeenCalledOnce();});});
