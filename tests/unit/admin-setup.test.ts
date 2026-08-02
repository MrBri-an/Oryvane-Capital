import { describe, expect, it } from "vitest";
import { ADMIN_SETUP_TTL_SECONDS, createSetupGrant, setupTokenMatches, verifySetupGrant } from "@/security/admin-setup";

describe("first administrator setup grants",()=>{
  const user="aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",secret="a-secure-setup-token-that-is-long-enough";
  it("compares setup tokens without returning the configured value",()=>{expect(setupTokenMatches(secret,secret)).toBe(true);expect(setupTokenMatches("wrong",secret)).toBe(false);});
  it("binds a short-lived grant to the authenticated user",()=>{const now=1_700_000_000_000;const grant=createSetupGrant(user,secret,now);expect(verifySetupGrant(grant,user,secret,now+1000)).toBe(true);expect(verifySetupGrant(grant,"bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",secret,now+1000)).toBe(false);expect(verifySetupGrant(grant,user,secret,now+(ADMIN_SETUP_TTL_SECONDS+1)*1000)).toBe(false);});
  it("rejects tampered grants",()=>{const grant=createSetupGrant(user,secret);expect(verifySetupGrant(`${grant}x`,user,secret)).toBe(false);});
});
