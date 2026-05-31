import fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf-8');

const helpsEnReplacement = `const helpsEn: Record<string, HelpInfo> = {
        ls: { 
          cat: 'FILE', related: ['cd', 'pwd'], 
          desc: "Lists files/folders or thread posts.", 
          usage: "ls [dir_or_thread_id]",
          options: [
            { opt: '-r', desc: 'Reverse the order when viewing thread posts.' }
          ],
          examples: [
            { cmd: "ls", desc: "List contents of the current directory." },
            { cmd: "ls /scripts", desc: "List contents of a specific directory." },
            { cmd: "ls 1700000000000", desc: "List posts of a specific BBS thread." },
          ]
        },
        cd: { 
          cat: 'FILE', related: ['ls', 'pwd'], 
          desc: "Changes directory or enters a thread context.", 
          usage: "cd <path_or_thread_id>",
          examples: [
            { cmd: "cd /", desc: "Change to the root directory." },
            { cmd: "cd ..", desc: "Move up one directory." },
            { cmd: "cd 1700000000000", desc: "Enter a thread context for subsequent commands." }
          ]
        },
        pwd: { 
          cat: 'FILE', related: ['ls', 'cd'], 
          desc: "Prints current working directory path.", 
          usage: "pwd",
          examples: [
            { cmd: "pwd", desc: "Prints the path (e.g. /scripts)." }
          ]
        },
        mkdir: { cat: 'FILE', related: ['touch', 'rm'], desc: "Creates a new directory (folder).", usage: "mkdir <folder>", examples: [{ cmd: "mkdir my_folder", desc: "Creates a directory in the current location." }] },
        touch: { cat: 'FILE', related: ['mkdir', 'nano'], desc: "Creates an empty file if it doesn't exist.", usage: "touch <file>", examples: [{ cmd: "touch note.txt", desc: "Creates note.txt." }] },
        rm: { cat: 'FILE', related: ['mv', 'cp'], desc: "Removes a file or directory.", usage: "rm [-r] <path>", options: [{ opt: "-r", desc: "Recursively remove a directory and its contents." }], examples: [{ cmd: "rm old.txt", desc: "Deletes a file." }, { cmd: "rm -r folder/", desc: "Deletes a folder and all contents." }] },
        mv: { cat: 'FILE', related: ['cp', 'rm'], desc: "Moves or renames a file/directory.", usage: "mv <src> <dst>", examples: [{ cmd: "mv old.txt new.txt", desc: "Renames the file." }, { cmd: "mv file.txt folder/", desc: "Moves the file to a folder." }] },
        cp: { cat: 'FILE', related: ['mv', 'rm'], desc: "Copies a file.", usage: "cp <src> <dst>", examples: [{ cmd: "cp file1.txt file2.txt", desc: "Copies file1 to file2." }] },
        nano: { cat: 'FILE', related: ['edit', 'write', 'cat'], desc: "Opens the text editor in the browser to edit a file.", usage: "nano <file>", examples: [{ cmd: "nano src.js", desc: "Opens the editor." }] },
        edit: { cat: 'FILE', related: ['nano', 'write'], desc: "Opens the text editor (alias for nano).", usage: "edit <file>", examples: [{ cmd: "edit src.js", desc: "Opens the editor." }] },
        write: { cat: 'FILE', related: ['nano', 'cat'], desc: "Writes text directly to a file, overwriting it.", usage: "write <file> <text>", examples: [{ cmd: "write test.txt Hello", desc: "Writes 'Hello' into test.txt." }] },
        
        threads: { cat: 'BBS', related: ['mkthread', 'read'], desc: "Lists all BBS threads on the server.", usage: "threads [-r]", options:[{opt:"-r", desc:"Reverse sort order (newest first)."}], examples: [{ cmd: "threads", desc: "Lists recent threads." }] },
        mkthread: { cat: 'BBS', related: ['threads', 'post'], desc: "Creates a new BBS thread.", usage: "mkthread <title>", examples: [{ cmd: "mkthread \\"New Topic\\"", desc: "Creates a thread with the specified title." }] },
        post: { cat: 'BBS', related: ['threads', 'read', 'cat'], desc: "Posts a reply to a thread.", usage: "post [id] <msg>", examples: [{ cmd: "post 1700 Hello", desc: "Posts 'Hello' to the specified thread ID." }, {cmd: "post hello", desc: "Posts to the current thread if you're in one."}] },
        cat: { cat: 'BBS', related: ['read', 'nano'], desc: "Prints file content or all replies in a thread.", usage: "cat <path_or_id>", examples: [{ cmd: "cat note.txt", desc: "Shows file contents." }, { cmd: "cat 1700", desc: "Shows all posts of the thread." }] },
        read: { cat: 'BBS', related: ['cat', 'threads'], desc: "Prints all posts of a BBS thread.", usage: "read <id>", examples: [{ cmd: "read 1700", desc: "Reads thread comments." }] },
        
        sh: { cat: 'EXEC', related: ['js', 'watch'], desc: "Executes a shell script.", usage: "sh <file.sh>", examples: [{ cmd: "sh run.sh", desc: "Runs the shell script." }] },
        js: { cat: 'EXEC', related: ['node', 'sh'], desc: "Evaluates JavaScript code.", usage: "js <code>", examples: [{ cmd: "js \\"console.log(1+1)\\"", desc: "Executes JS and captures output." }] },
        node: { cat: 'EXEC', related: ['js'], desc: "Evaluates JavaScript code (alias for js).", usage: "node <code>", examples: [{ cmd: "node app.js", desc: "Executes a JS file." }] },
        expr: { cat: 'EXEC', related: ['bc', 'calc'], desc: "Evaluates simple math expressions.", usage: "expr <math>", examples: [{ cmd: "expr 1 + 2", desc: "Calculates addition." }] },
        bc: { cat: 'EXEC', related: ['expr', 'calc'], desc: "Evaluates math expressions from stdin or arguments.", usage: "bc <math>", examples: [{ cmd: "echo '1+1' | bc", desc: "Evaluates from stdin." }] },
        calc: { cat: 'EXEC', related: ['expr', 'bc'], desc: "Advanced math calculation with variable support.", usage: "calc <math>", examples: [{ cmd: "calc a=5; a*2", desc: "Supports variable assignment." }] },
        watch: { cat: 'EXEC', related: ['sh'], desc: "Executes a command periodically.", usage: "watch <sec> <cmd>", examples: [{ cmd: "watch 2 date", desc: "Runs 'date' every 2 seconds." }, { cmd: "watch stops", desc: "Stops the periodic execution." }] },
        ai: { cat: 'EXEC', related: ['chat'], desc: "AI automation, interactive chat, or config.", usage: "ai [chat|config|<prompt>]", examples: [{ cmd: "ai config", desc: "Opens API key config dialog." }, { cmd: "ai chat", desc: "Enters interactive chat mode." }, { cmd: "ai create a game", desc: "Prompts the AI." }] },
        chat: { cat: 'EXEC', related: ['ai'], desc: "Enters an interactive chat mode with the AI.", usage: "chat", examples: [{ cmd: "chat", desc: "Starts chat mode." }] },

        echo: { cat: 'UTIL', related: ['cat'], desc: "Prints text to standard output.", usage: "echo <text>", examples: [{ cmd: "echo Hello World", desc: "Prints 'Hello World'." }, { cmd: "echo text > file.txt", desc: "Writes text to a file." }] },
        yes: { cat: 'UTIL', related: ['echo'], desc: "Repeatedly outputs a line until killed.", usage: "yes [text]", examples: [{ cmd: "yes y", desc: "Outputs 'y' infinitely." }] },
        seq: { cat: 'UTIL', related: ['echo'], desc: "Prints a sequence of numbers.", usage: "seq <first> <last>", examples: [{ cmd: "seq 1 5", desc: "Outputs numbers from 1 to 5." }] },
        head: { cat: 'UTIL', related: ['tail', 'cat'], desc: "Outputs the first part of files.", usage: "head [-n limit] <file>", options:[{opt:"-n", desc:"Number of lines to display."}], examples: [{ cmd: "head -n 5 log.txt", desc: "Outputs the first 5 lines." }] },
        tail: { cat: 'UTIL', related: ['head', 'cat'], desc: "Outputs the last part of files.", usage: "tail [-n limit] <file>", options:[{opt:"-n", desc:"Number of lines to extract from the end."}], examples: [{ cmd: "tail -n 10 log.txt", desc: "Extracts the last 10 lines." }] },
        grep: { cat: 'UTIL', related: ['awk'], desc: "Prints lines matching a pattern.", usage: "grep [-i] [-v] <pattern> <file>", options: [ { opt: "-i", desc: "Case-insensitive matching." }, { opt: "-v", desc: "Invert match (exclude pattern)." } ], examples: [{ cmd: "grep error log.txt", desc: "Extracts lines containing 'error'." }] },
        wc: { cat: 'UTIL', related: ['cat'], desc: "Prints newline, word, and byte counts.", usage: "wc [-l] <file>", options:[{opt:"-l", desc:"Count lines only."}], examples: [{ cmd: "wc log.txt", desc: "Prints file stats." }] },
        sleep: { cat: 'UTIL', related: ['watch'], desc: "Delays execution for a specified time.", usage: "sleep <sec>", examples: [{ cmd: "sleep 3; echo 'done'", desc: "Waits 3 seconds then prints text." }] },
        reset: { cat: 'UTIL', related: ['clear'], desc: "Resets the terminal display.", usage: "reset", examples: [{ cmd: "reset", desc: "Clears and resets the screen state." }] },
        sort: { cat: 'UTIL', related: ['uniq'], desc: "Sorts lines of text files.", usage: "sort [-r|-n] <file>", options:[{opt:"-r",desc:"Reverse order."},{opt:"-n",desc:"Numeric sort."}], examples: [{ cmd: "sort log.txt", desc: "Sorts alphabetically." }] },
        uniq: { cat: 'UTIL', related: ['sort'], desc: "Removes consecutive duplicate lines.", usage: "uniq [-c] <file>", options:[{opt:"-c",desc:"Count occurrences."}], examples: [{ cmd: "sort file | uniq", desc: "Sorts then removes duplicates." }] },
        rev: { cat: 'UTIL', related: ['cat'], desc: "Reverses characters in each line.", usage: "rev <file>", examples: [{ cmd: "echo 'hello' | rev", desc: "Outputs 'olleh'." }] },
        shuf: { cat: 'UTIL', related: ['sort'], desc: "Generates random permutations of lines.", usage: "shuf <file>", examples: [{ cmd: "shuf items.txt", desc: "Shuffles the output lines." }] },
        base64: { cat: 'UTIL', related: ['cat'], desc: "Base64 encodes or decodes data.", usage: "base64 [-d] <file>", options: [{opt: "-d", desc: "Decode base64 string."}], examples: [{ cmd: "echo 'hey' | base64", desc: "Encodes to base64." }, { cmd: "echo 'aGV5Cg==' | base64 -d", desc: "Decodes to original text." }] },
        cowsay: { cat: 'UTIL', related: ['fortune'], desc: "Generates an ASCII art speaking cow.", usage: "cowsay <text>", examples: [{ cmd: "cowsay moo", desc: "Cow says moo." }] },
        fortune: { cat: 'UTIL', related: ['cowsay'], desc: "Prints a random adage or quote.", usage: "fortune", examples: [{ cmd: "fortune", desc: "Shows a random quote." }] },
        date: { cat: 'UTIL', related: ['uptime'], desc: "Prints the system date and time.", usage: "date", examples: [{ cmd: "date", desc: "Shows current local time." }] },
        uptime: { cat: 'UTIL', related: ['date'], desc: "Tells you how long the system has been running.", usage: "uptime", examples: [{ cmd: "uptime", desc: "Shows uptime duration." }] },
        xargs: { cat: 'UTIL', related: ['echo'], desc: "Builds and executes command lines from stdin.", usage: "xargs <cmd>", examples: [{ cmd: "echo 'f1.txt f2.txt' | xargs rm", desc: "Passes files to rm." }] },
        awk: { cat: 'UTIL', related: ['grep'], desc: "Pattern scanning and processing language.", usage: "awk '<prog>' <file>", examples: [{ cmd: "awk '{print $1}' log.txt", desc: "Extracts the first word of each line." }] },
        dir: { cat: 'UTIL', related: ['ls'], desc: "Lists directory contents (alias for ls).", usage: "dir [path]", examples: [{ cmd: "dir", desc: "Lists current directory contents." }] },
        
        exit: { cat: 'SYS', related: ['quit', 'clear'], desc: "Exits interactive modes (e.g. AI chat).", usage: "exit", examples: [{ cmd: "exit", desc: "Ends the current session." }] },
        quit: { cat: 'SYS', related: ['exit'], desc: "Exits interactive modes (alias for exit).", usage: "quit", examples: [{ cmd: "quit", desc: "Ends the current session." }] },
        
        "for": { cat: 'EXEC', related: ['if', 'function'], desc: "Loop construct (for in do done).", usage: "for i in a b c; do echo $i; done", examples: [{ cmd: "for file in *.txt; do cat $file; done", desc: "Processes text files." }] },
        "if": { cat: 'EXEC', related: ['for', 'function'], desc: "Conditional construct (if [ cond ]; then fi).", usage: "if [ -z \\$A ]; then echo a; fi", examples: [{ cmd: "if [ 1 = 1 ]; then echo yes; fi", desc: "Executes if truthy." }] },
        "function": { cat: 'EXEC', related: ['for', 'if'], desc: "Defines a custom shell function.", usage: "function f() { echo \\$1; }", examples: [{ cmd: "function greet() { echo \\"Hello \\$1\\"; }", desc: "Defines a function." }] },

        web: { cat: 'UI', related: ['preview', 'theme'], desc: "Mounts HTML to the virtual monitor.", usage: "web <file> | web off", examples: [{ cmd: "web index.html", desc: "Opens file in preview." }, { cmd: "web off", desc: "Closes the preview." }] },
        preview: { cat: 'UI', related: ['web'], desc: "Mounts HTML to virtual monitor (alias for web).", usage: "preview <file> | preview off", examples: [{ cmd: "preview index.html", desc: "Previews the file." }] },
        theme: { cat: 'UI', related: ['themes', 'maketheme'], desc: "Changes the terminal UI theme color.", usage: "theme <name>", examples: [{ cmd: "theme matrix", desc: "Switches to Matrix theme." }, { cmd: "theme hacker", desc: "Switches to Hacker theme." }] },
        themes: { cat: 'UI', related: ['theme', 'maketheme'], desc: "Shows available terminal themes.", usage: "themes", examples: [{ cmd: "themes", desc: "Lists all themes." }] },
        maketheme: { cat: 'UI', related: ['theme', 'themes'], desc: "Starts interactive theme creator wizard.", usage: "maketheme", examples: [{ cmd: "maketheme", desc: "Starts the builder." }] },
        lang: { cat: 'UI', related: ['clear'], desc: "Switches system language (ja or en).", usage: "lang [ja|en]", examples: [{ cmd: "lang en", desc: "Switches to English." }] },
        clear: { cat: 'UI', related: ['history'], desc: "Clears terminal output screen.", usage: "clear", examples: [{ cmd: "clear", desc: "Cleans the terminal screen." }] },
        
        su: { cat: 'SYS', related: ['whoami'], desc: "Changes the alias displayed for your user.", usage: "su <username>", examples: [{ cmd: "su admin", desc: "Changes your username to admin." }] },
        whoami: { cat: 'SYS', related: ['su'], desc: "Prints the active user handle.", usage: "whoami", examples: [{ cmd: "whoami", desc: "Prints your name." }] },
        export: { cat: 'SYS', related: ['env', 'printenv'], desc: "Sets environment variable.", usage: "export KEY=value", examples: [{ cmd: "export FOO=bar", desc: "Sets FOO to bar." }] },
        env: { cat: 'SYS', related: ['export', 'printenv'], desc: "Prints all set environment variables.", usage: "env", examples: [{ cmd: "env", desc: "Prints variables." }] },
        printenv: { cat: 'SYS', related: ['export', 'env'], desc: "Prints environment variables.", usage: "printenv", examples: [{ cmd: "printenv", desc: "Prints variables." }] },
        alias: { cat: 'SYS', related: ['export', 'ls'], desc: "Defines a new command alias.", usage: "alias <name>=\\"<cmd>\\"", examples: [{ cmd: "alias ll=\\"ls -l\\"", desc: "Maps ll to ls -l." }, { cmd: "alias", desc: "Lists registered aliases." }] },
        history: { cat: 'SYS', related: ['clear'], desc: "Prints standard command history.", usage: "history", examples: [{ cmd: "history", desc: "Shows previous commands." }] },
        help: { cat: 'SYS', related: [], desc: "Prints help manual.", usage: "help [cmd]", examples: [{ cmd: "help", desc: "Shows index." }, { cmd: "help ls", desc: "Shows details for ls." }] }
      };`

code = code.replace(/const helpsEn: Record<string, HelpInfo> = \{[\s\S]*?\n      };\n/m, helpsEnReplacement + '\n');
fs.writeFileSync('src/App.tsx', code);
console.log("Done");
