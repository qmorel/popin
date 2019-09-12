import createFocusTrap from 'focus-trap';

const DataAttributes = {
  PopinId: 'data-popin',
  PopinBtnOpen: 'data-popin-open',
  PopinBtnClose: 'data-popin-close',
  PopinLoadUrl: 'data-popin-load'
};

const Selectors = {
  popin: '.js-popin',
  btnOpen: '.js-popin-open',
  btnClose: '.js-popin-close',
  popinMain: '.js-popin-main',
  popinContent: '.js-popin-content'
};

const Classes = {
  PopinOpen: 'is-enabled',
  PopinLoading: 'is-loading',
  BodyClassOpen: 'has-popinOpen',
  BodyClass: 'has-popinOpen',
};

export default class Popin {
  constructor(element, options = {}) {
    this.options = {
      // defaults
      trapFocus: true,
      clickOutside: true,
      opened: false,
      load: undefined,
      loadType: 'text',
      loadSelector: undefined,
      loadError: 'Une erreur est survenue lors du chargement du contenu.',
      thenOpen: undefined,
      // overides
      ...options,
      selectors: {
        ...Selectors,
        ...options.selectors
      },
      classes: {
        ...Classes,
        ...options.classes
      }
    };

    // Globals
    this._body = document.querySelector('body');
    this._element = element || document.querySelector(this.options.selectors.popin);
    this.popinId = this._element.dataset.popin;
    this.contentPopin = this._element.querySelector(`${this.options.selectors.popinContent}`);

    // Buttons
    this.openBtns = document.querySelectorAll(
      `${this.options.selectors.btnOpen}[${DataAttributes.PopinBtnOpen}="${this.popinId}"]`
    );
    this.closeBtns = document.querySelectorAll(
      `${this.options.selectors.btnClose}[${DataAttributes.PopinBtnClose}="${this.popinId}"]`
    );

    if (undefined !== this._element.dataset.popinLoad) {
      this.options.load = this._element.dataset.popinLoad
    }

    // Popin event listeners
    document.addEventListener(`open-${this.popinId}`, (e) => {
      if (e.detail && e.detail.thenOpen) {
        this.options.thenOpen = e.detail.thenOpen
      }

      if (e.detail && e.detail.callback) {
        this.options.callback = e.detail.callback
      }

      this.open();
    });

    document.addEventListener(`close-${this.popinId}`, () => {
      this.close();
    });

    // Keyboard events
    this._element.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        this.close();
      }
    });

    // Buttons events
    [...this.openBtns].map(btn => btn.addEventListener('click', e => this.handleOpenBtn(e)));

    [...this.closeBtns].map(btn => btn.addEventListener('click', e => this.handleCloseBtn(e)));

    // Popin is opened by default
    if (this.options.opened) this.open();
  };

  handleOpenBtn(e) {
    e.preventDefault();
    this.open(e.target);
  }

  handleCloseBtn(e) {
    e.preventDefault();
    this.close();
  }

  open(button = undefined) {
    // Adding classes and attributes
    this._element.classList.add(this.options.classes.PopinOpen);
    this._element.setAttribute('aria-hidden', false);


    // Click outside event
    if(this.options.clickOutside) {
      this._element.addEventListener('click', event => {
        const { target } = event;
        if (!target.closest(this.options.selectors.popinMain)
            && !target.isEqualNode(button)) {
          this.close();
        }
      }, false);
    }

    // Focus handling
    if (this.options.trapFocus) {
      this.trapFocus = createFocusTrap(this._element);
      this.trapFocus.activate();
      this._element.focus();
    }

    // Load content
    if (this.options.load !== undefined && "" !== this.options.load) {
      this.loadContent(this.options.load)
    } else {
      // execute callback
      if (this.options.callback !== undefined) {
        this.options.callback();
      }
    }

    // Trigger open event
    const opentEvent = new CustomEvent("popin-open", {
      detail: {
        popinId: this.popinId,
      }
    });
    this._element.dispatchEvent(opentEvent);

    // Set body classes
    this._body.classList.add(this.options.classes.BodyClassOpen);
  }

  close() {
    // disable focus trap
    if (this.options.trapFocus) {
      this.trapFocus.deactivate();
    }
    // Set classes and attributes
    this._element.classList.remove(this.options.classes.PopinOpen);
    this._element.setAttribute('aria-hidden', true);

    if (this.options.thenOpen) {
      const thenOpenEvent = new CustomEvent(`open-${this.options.thenOpen}`);
      document.dispatchEvent(thenOpenEvent);
    }

    // Trigger close event
    const opentEvent = new CustomEvent("popin-close", {
      detail: {
        popinId: this.popinId,
      }
    });
    this._element.dispatchEvent(opentEvent);
  }

  loadContent(url) {
    // Clean popin content
    this.contentPopin.innerHTML = '';
    // Set loading class
    this.contentPopin.classList.add(this.options.classes.PopinLoading);
    // make ajax call
    fetch(url)
      .then((response) => {
        // Remove loading class
        this.contentPopin.classList.remove(this.options.classes.PopinLoading);

        if ("json" === this.options.loadType) {
          // Repsonse is JSON
          response.json().then(content => {
            content = this.options.loadSelector ? content[this.options.loadSelector] : content[0];
  
            this.contentPopin.insertAdjacentHTML('afterbegin', content);
            // execute callback
            if (this.options.callback !== undefined) {
              this.options.callback();
            }
          });

        } else {
          // Classic HTML response
          response.text().then(content => {
            if (this.options.loadSelector) {
              const div = document.createElement("div");
              div.innerHTML = content;
              content = div.querySelector(this.options.loadSelector).outerHTML
            }
            this.contentPopin.insertAdjacentHTML('afterbegin', content);
            // execute callback
            if (this.options.callback !== undefined) {
              this.options.callback();
            }
          });

        }
      })
      .catch(() => {
        this.contentPopin.innerHTML = this.options.loadError;
      });
  }
}
