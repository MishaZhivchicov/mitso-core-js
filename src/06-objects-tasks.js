/* ************************************************************************************************
 *                                                                                                *
 * Please read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 ************************************************************************************************ */

/**
 * Returns the rectangle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    const r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
  this.width = width;
  this.height = height;
  this.getArea = function () {
    return this.width * this.height;
  };
}

/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
  return JSON.stringify(obj);
}

/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    const r = fromJSON(Circle.prototype, '{"radius":10}');
 *
 */
function fromJSON(proto, json) {
  const obj = JSON.parse(json);
  return Object.setPrototypeOf(obj, proto);
}

/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class
 * and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurrences
 *
 * All types of selectors can be combined using the combination ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy
 * and implement the functionality to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string representation
 * according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple,
 * clear and readable as possible.
 *
 * @example
 *
 *  const builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()
 *    => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()
 *    => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()
 *    => 'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */

class Selector {
  constructor(selector1, combinator, selector2) {
    if (selector1 && combinator && selector2) {
      this.selector1 = selector1;
      this.combinator = combinator;
      this.selector2 = selector2;
      this.isCombined = true;
      return;
    }
    this.elementValue = '';
    this.idValue = '';
    this.classValues = [];
    this.attrValues = [];
    this.pseudoClassValues = [];
    this.pseudoElementValue = '';
    this.order = 0;
    this.isCombined = false;
  }

  ensureOrder(orderValue) {
    if (orderValue < this.order) {
      throw new Error(
        'Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element',
      );
    }
    this.order = orderValue;
  }

  ensureSingle(fieldName) {
    if (this[fieldName]) {
      throw new Error(
        'Element, id and pseudo-element should not occur more then one time inside the selector',
      );
    }
  }

  element(value) {
    this.ensureOrder(1);
    this.ensureSingle('elementValue');
    const next = this.clone();
    next.elementValue = value;
    next.order = 1;
    return next;
  }

  id(value) {
    this.ensureOrder(2);
    this.ensureSingle('idValue');
    const next = this.clone();
    next.idValue = `#${value}`;
    next.order = 2;
    return next;
  }

  class(value) {
    this.ensureOrder(3);
    const next = this.clone();
    next.classValues.push(`.${value}`);
    next.order = 3;
    return next;
  }

  attr(value) {
    this.ensureOrder(4);
    const next = this.clone();
    next.attrValues.push(`[${value}]`);
    next.order = 4;
    return next;
  }

  pseudoClass(value) {
    this.ensureOrder(5);
    const next = this.clone();
    next.pseudoClassValues.push(`:${value}`);
    next.order = 5;
    return next;
  }

  pseudoElement(value) {
    this.ensureOrder(6);
    this.ensureSingle('pseudoElementValue');
    const next = this.clone();
    next.pseudoElementValue = `::${value}`;
    next.order = 6;
    return next;
  }

  clone() {
    const copy = new Selector();
    copy.elementValue = this.elementValue;
    copy.idValue = this.idValue;
    copy.classValues = [...this.classValues];
    copy.attrValues = [...this.attrValues];
    copy.pseudoClassValues = [...this.pseudoClassValues];
    copy.pseudoElementValue = this.pseudoElementValue;
    copy.order = this.order;
    return copy;
  }

  stringify() {
    if (this.isCombined) {
      return `${this.selector1.stringify()} ${this.combinator} ${this.selector2.stringify()}`;
    }
    return (
      this.elementValue
      + this.idValue
      + this.classValues.join('')
      + this.attrValues.join('')
      + this.pseudoClassValues.join('')
      + this.pseudoElementValue
    );
  }
}

const cssSelectorBuilder = {
  element(value) {
    return new Selector().element(value);
  },

  id(value) {
    return new Selector().id(value);
  },

  class(value) {
    return new Selector().class(value);
  },

  attr(value) {
    return new Selector().attr(value);
  },

  pseudoClass(value) {
    return new Selector().pseudoClass(value);
  },

  pseudoElement(value) {
    return new Selector().pseudoElement(value);
  },

  combine(selector1, combinator, selector2) {
    return new Selector(selector1, combinator, selector2);
  },
};

module.exports = {
  Rectangle,
  getJSON,
  fromJSON,
  cssSelectorBuilder,
};
