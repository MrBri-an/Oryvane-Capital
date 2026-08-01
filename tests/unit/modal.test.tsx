import { render,screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe,expect,it,vi } from "vitest";
vi.mock("motion/react",()=>({AnimatePresence:({children}:{children:React.ReactNode})=>children,motion:{dialog:"dialog",div:"div"},useReducedMotion:()=>true}));
import { Modal } from "@/components/ui/modal";
describe("accessible modal",()=>{it("has dialog semantics, labelled content, and handles Escape",async()=>{const close=vi.fn();render(<Modal open onClose={close} title="Confirm transfer" description="Review the operation"><button>Continue</button></Modal>);const dialog=screen.getByRole("dialog",{name:"Confirm transfer"});expect(dialog).toHaveAttribute("aria-describedby","modal-description");dialog.dispatchEvent(new Event("cancel",{cancelable:true}));expect(close).toHaveBeenCalledOnce();await userEvent.click(screen.getByRole("button",{name:"Close dialog"}));expect(close).toHaveBeenCalledTimes(2);});});
