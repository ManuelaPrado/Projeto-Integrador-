// scripts/run-all.js
//
// Builda o cliente React direto dentro de src/main/resources/static
// (configurado em frontend/vite.config.js) e sobe a API em seguida, para
// que o próprio Spring Boot sirva o Front-end e o Back-end juntos, na
// mesma origem e mesma porta — um único comando, sem precisar de dois
// terminais nem de CORS entre eles.
//
// Uso:
//   node scripts/run-all.js
// (ou "npm start", que só chama este script)
//
// Não usa nenhuma dependência externa — só módulos nativos do Node.

const { spawnSync, spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const API_DIR = path.join(__dirname, "..");
const FRONTEND_DIR = path.join(API_DIR, "frontend");
const isWindows = process.platform === "win32";

function run(command, args, cwd, env) {
    console.log(`\n> ${command} ${args.join(" ")}  (em ${path.relative(API_DIR, cwd) || "."})`);
    const resultado = spawnSync(command, args, {
        cwd,
        stdio: "inherit",
        shell: isWindows, // necessário no Windows para resolver "npm"/"npm.cmd"
        env: env || process.env,
    });
    if (resultado.status !== 0) {
        console.error(`\nComando falhou: ${command} ${args.join(" ")}`);
        process.exit(resultado.status ?? 1);
    }
}

// Verifica se um caminho é, de fato, a raiz de um JDK válido (tem
// bin/java ou bin/java.exe dentro dele).
function ehJdkValido(candidato) {
    if (!candidato) return false;
    const javaBin = path.join(candidato, "bin", isWindows ? "java.exe" : "java");
    return fs.existsSync(javaBin);
}

// Tenta localizar o JDK sozinho, sem exigir que a pessoa configure
// JAVA_HOME manualmente no Windows/Linux/macOS.
function detectarJavaHome() {
    // 1. Já está configurado corretamente? Usa direto.
    if (ehJdkValido(process.env.JAVA_HOME)) {
        return process.env.JAVA_HOME;
    }

    // 2. Pergunta pro sistema onde está o executável "java" no PATH.
    const comandoBusca = isWindows ? "where" : "which";
    const resultadoBusca = spawnSync(comandoBusca, ["java"], { encoding: "utf-8" });
    if (resultadoBusca.status === 0 && resultadoBusca.stdout) {
        const primeiraLinha = resultadoBusca.stdout.split(/\r?\n/).find(Boolean);
        if (primeiraLinha) {
            let javaExe = primeiraLinha.trim();
            try {
                javaExe = fs.realpathSync(javaExe); // resolve symlinks (comum no Linux/macOS)
            } catch {
                // segue com o caminho original se não conseguir resolver
            }
            // java(.exe) normalmente fica em <JAVA_HOME>/bin/java(.exe)
            const candidato = path.dirname(path.dirname(javaExe));
            if (ehJdkValido(candidato)) {
                return candidato;
            }
        }
    }

    // 3. Varre pastas comuns de instalação, caso o "where/which" não ajude.
    const pastasComuns = isWindows
        ? [
              "C:\\Program Files\\Eclipse Adoptium",
              "C:\\Program Files\\Java",
              "C:\\Program Files\\Microsoft",
              "C:\\Program Files\\Zulu",
              "C:\\Program Files\\Amazon Corretto",
          ]
        : [
              "/usr/lib/jvm",
              "/Library/Java/JavaVirtualMachines",
              path.join(os.homedir(), ".sdkman/candidates/java"),
          ];

    for (const pasta of pastasComuns) {
        if (!fs.existsSync(pasta)) continue;
        const subpastas = fs.readdirSync(pasta).sort().reverse(); // versões mais novas primeiro
        for (const nome of subpastas) {
            let candidato = path.join(pasta, nome);
            // no macOS, o JDK real fica em .../Contents/Home
            const contentsHome = path.join(candidato, "Contents", "Home");
            if (fs.existsSync(contentsHome)) candidato = contentsHome;

            if (ehJdkValido(candidato)) {
                return candidato;
            }
        }
    }

    return null;
}

const javaHomeDetectado = detectarJavaHome();

if (!javaHomeDetectado) {
    console.error(
        "\nNão encontrei nenhuma instalação do Java 21+ nesta máquina.\n" +
            "Instale o JDK 21 (ex: https://adoptium.net) e rode este comando de novo.\n"
    );
    process.exit(1);
}

console.log(`\n> Usando JAVA_HOME: ${javaHomeDetectado}`);

// Repassa esse JAVA_HOME apenas para os processos que este script inicia
// (não mexe em nenhuma configuração permanente do Windows/Linux/macOS).
const envComJava = { ...process.env, JAVA_HOME: javaHomeDetectado };

// 1. Instala as dependências do front-end, se necessário.
if (!fs.existsSync(path.join(FRONTEND_DIR, "node_modules"))) {
    run(isWindows ? "npm.cmd" : "npm", ["install"], FRONTEND_DIR);
}

// 2. Builda o front-end. O vite.config.js já manda o resultado direto
//    para src/main/resources/static (ver outDir).
run(isWindows ? "npm.cmd" : "npm", ["run", "build"], FRONTEND_DIR);

// 3. Sobe a API (Maven Wrapper) — o Spring Boot passa a servir o React
//    também, em http://localhost:8080.
const mvnw = isWindows ? "mvnw.cmd" : "./mvnw";
console.log(`\n> Subindo a API e o Front-end juntos em http://localhost:8080 ...\n`);
const processoApi = spawn(mvnw, ["spring-boot:run"], {
    cwd: API_DIR,
    stdio: "inherit",
    shell: isWindows,
    env: envComJava,
});

processoApi.on("exit", (codigo) => process.exit(codigo ?? 0));
