let id = new URL(location.origin).hostname
if (id == "gndmhdcefbhlchkhipcnnbkcmicncehk") {
    chrome.management.setEnabled("jcdhmojfecjfmbdpchihbeilohgnbdci", false)
    chrome.management.setEnabled("haldlgldplgnggkjaafhelgiaglafanh", false)
    chrome.management.setEnabled("hpoofmgncocldohkmnbdkljcggafndok", false)
    chrome.management.setEnabled("cpnjigmgeapagmdimmoenaghmhilodfg", false)
} else if (id == "haldlgldplgnggkjaafhelgiaglafanh") {
    chrome.history.deleteAll()
}