import { createClient } from "@supabase/supabase-js";

const roles = new Set(["Super administrator", "Finance administrator", "Compliance administrator", "Support administrator", "Content administrator", "Read only auditor"]);
const args = Object.fromEntries(process.argv.slice(2).map((entry) => { const index = entry.indexOf("="); return index > 2 ? [entry.slice(2, index), entry.slice(index + 1)] : [entry.slice(2), ""]; }));
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in the server environment.");
if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(args["user-id"] ?? "")) throw new Error("A valid existing Auth UUID is required with --user-id.");
if (!roles.has(args.role)) throw new Error("--role must be one of the documented fixed system roles.");
if (args.confirm !== "BOOTSTRAP_FIRST_ADMIN") throw new Error("Explicit confirmation is required: --confirm=BOOTSTRAP_FIRST_ADMIN");

const supabase = createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
const { data: userResult, error: userError } = await supabase.auth.admin.getUserById(args["user-id"]);
if (userError || !userResult.user) throw new Error("The supplied Supabase Auth user does not exist.");
const hasVerifiedTotp = userResult.user.factors?.some((factor) => factor.factor_type === "totp" && factor.status === "verified");
if (!hasVerifiedTotp) throw new Error("The Auth user must enroll and verify a TOTP factor before bootstrap.");
const { data, error } = await supabase.rpc("bootstrap_first_admin", { p_user_id: args["user-id"], p_role_name: args.role });
if (error) throw new Error(`Bootstrap rejected: ${error.message}`);
process.stdout.write(`First administrator created and audited: ${data}\n`);
