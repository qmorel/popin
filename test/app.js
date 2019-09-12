import Popin from '../src/popin'

document
    .querySelectorAll('.js-popin')
    .forEach(element => {
        element.popin = new Popin(element)
    });

document
    .querySelectorAll('.js-popin-opened')
    .forEach(element => {
        element.popin = new Popin(element, {
            opened: true,
            thenOpen: 'popin-load'
        })
    });

document
    .querySelectorAll('.js-popin-custom')
    .forEach(element => {
        element.popin = new Popin(element, {
            selectors: {
                btnOpen: '.js-popin-custom-open',
                btnClose: '.js-popin-custom-close',
                popinMain: '.js-popin-custom-main',
                popinContent: '.js-popin-custom-content'
            }
        })
    });

document
    .querySelectorAll('.js-popin-load')
    .forEach(element => {
        element.popin = new Popin(element, {
            load: 'https://jsonplaceholder.typicode.com/posts/1',
            loadType: 'json',
            loadSelector: 'body',
        })
    });