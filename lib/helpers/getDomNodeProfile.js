import { getDomNodePath } from './getDomNodePath';

export function getDomNodeProfile(el) {
  return {
    action: el.action,
    class: el.className,
    href: getElementProps(el, 'href'),
    id: getElementProps(el, 'id'),
    event_key: getElementProps(el, 'data-event-key'),
    method: el.method,
    name: el.name,
    node_name: el.nodeName,
    selector: getDomNodePath(el),
    text: getElementProps(el, 'text') || getElementProps(el, "innerText"),
    value: getElementProps(el, 'value'),
    title: getElementProps(el, 'title'),
    data_attributes: getDataAttributes(el),
    type: el.type,
    x_position: el.offsetLeft || el.clientLeft || null,
    y_position: el.offsetTop || el.clientTop || null
  };
}

const getDataAttributes = (el) => {
  let data = {};
  [].forEach.call(el.attributes, function(attr) {
      if (/^data-/.test(attr.name)) {
          let camelCaseName = attr.name.substr(5).replace(/-(.)/g, function ($0, $1) {
              return $1.toUpperCase();
          });
          data[camelCaseName] = attr.value;
      }
  }); 
  return data
} 


const getElementProps = (el, prop) => {
  if (el[prop]) {
    return el[prop];
  }
  if (el.hasAttribute && el.hasAttribute(prop)) {
    return el.getAttribute(prop);
  }
  if (el.parentNode) {
    return getElementProps(el.parentNode, prop);
  }
  return null;
};
