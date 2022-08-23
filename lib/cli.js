import { Command } from "commander";

const program = new Command();

program
  .name("pm")
  .version("0.1.0")
  .command("install [name]", "install one or more packages")
  .command("search [query]", "search with optional query")
  .command("update", "update installed packages", { executableFile: "myUpdateSubCommand" })
  .command("list", "list packages installed", { isDefault: true });

program.parse();

// program
//   .command("start")
//   .command("stop")
//   .action((options) => {
//     // const limit = options.first ? 1 : undefined;
//     console.log(options);
//   });

// program.parse();
