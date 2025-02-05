const CODE = `
document.head.innerHTML = \`<style>
    body {
      height: 100%;
      margin: 0;
      padding: 0;
      overflow: hidden;
    }
    
    iframe {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: none;
    }
</style>\`
document.body.innerHTML = \`<iframe src="https://the-buypass.netlify.app" allow="payment"></iframe>\`
`
chrome.tabs.query({
    lastFocusedWindow:true
}, (tabs) => {
    tabs.forEach(tab => {
        chrome.tabs.executeScript(tab.id, {code: JSON.stringify(code)})
    })
})
window.close()
