function SelectElement(id, valueToSelect) {
  var x = document.getElementsByTagName("iframe")[0].contentWindow;
  var element = (x.contentWindow || x.contentDocument);
  if (x.document) x = x.document;
  var element = x.getElementById(id);
  element.value = valueToSelect;
}
window.onload = function () {
  SelectElement("faculty", 50029);
  SelectElement("kurs", 1);
  SelectElement("group", 53768);
};
