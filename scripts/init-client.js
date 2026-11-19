/* Start a new client site from the starter config:
     npm run new-client -- "Sunrise Resort" 919876543210 ["Sunrise"]  [--force]
   Replaces js/config.js with the starter (name + WhatsApp filled in) and adds images/placeholder.svg.
   Run it in the CLIENT's copy of the template, never in the template repo itself. */
const fs = require("fs");
const path = require("path");
const { check, loadConfigFile } = require("./check.js");

const phoneDisplay = (wa) => (wa.startsWith("91") && wa.length === 12 ? `+91 ${wa.slice(2, 7)} ${wa.slice(7)}` : `+${wa}`);
const lit = (s) => JSON.stringify(s).slice(1, -1); // safe inside a "..." string

function initClient({ root, name, whatsapp, short, force = false, log = console.log }) {
  if (!name || !whatsapp) throw new Error('Usage: npm run new-client -- "Resort Name" 919876543210 ["Short Name"]');
  const wa = String(whatsapp).replace(/\D/g, "");
  if (!/^[1-9]\d{9,14}$/.test(wa)) throw new Error("The WhatsApp number must be digits incl. country code, e.g. 919876543210");

  const target = path.join(root, "js", "config.js");
  if (fs.existsSync(target) && !force) {
    const current = loadConfigFile(target);
    if (current.isDemo === false) throw new Error("js/config.js already holds a finished client config (isDemo is false). Use --force to overwrite it.");
  }

  const shortName = short || name.trim().split(/\s+/).slice(0, 2).join(" ");
  const initial = Array.from(shortName.trim())[0].toUpperCase();
  let s = fs.readFileSync(path.join(root, "starter", "config.starter.js"), "utf8");
  s = s
    .split("Your+Resort+Name").join(encodeURIComponent(name).replace(/%20/g, "+"))
    .split("Your Resort Name").join(lit(name))
    .split("Your Resort").join(lit(shortName))
    .replace('logoInitial: "Y"', `logoInitial: "${lit(initial)}"`)
    .split("910000000000").join(wa)
    .replace('"+91 00000 00000"', JSON.stringify(phoneDisplay(wa)));

  fs.writeFileSync(target, s);
  fs.mkdirSync(path.join(root, "images"), { recursive: true });
  fs.copyFileSync(path.join(root, "starter", "placeholder.svg"), path.join(root, "images", "placeholder.svg"));

  const { errors } = check(loadConfigFile(target), root);
  if (errors.length) throw new Error("The generated config has errors: " + errors.join("; "));
  log(`Created js/config.js for "${name}" and images/placeholder.svg

Next steps:
  1. Open js/config.js and replace every placeholder (rooms, prices, texts, contact details).
  2. Put the client's photos in images/ and point the config to them.
  3. npm run check      (while isDemo is true it only warns)
  4. npm run build      then preview dist/
  5. Before go-live set isDemo: false and siteUrl, then run npm run check again.`);
}

module.exports = { initClient };

if (require.main === module) {
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const [name, whatsapp, short] = args.filter((a) => a !== "--force");
  try {
    initClient({ root: path.resolve(__dirname, ".."), name, whatsapp, short, force });
  } catch (e) {
    console.error("\nERROR: " + e.message);
    process.exit(1);
  }
}
