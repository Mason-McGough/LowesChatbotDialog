// var productsList = [];
var productsList = [
    { id: 0, title: 'Samsung 4.5-cu ft High Efficiency Stackable Front-Load Washer (Merlot) ENERGY STAR', src: 'https://mobileimages.lowes.com/product/converted/887276/887276250946lg.jpg', price: '$649.00'}, 
    { id: 1, title: 'Samsung 4.5-cu ft High Efficiency Stackable Front-Load Washer (Merlot) ENERGY STAR', src: 'https://mobileimages.lowes.com/product/converted/887276/887276250946lg.jpg', price: '$649.00'}, 
    { id: 2, title: 'Samsung 4.5-cu ft High Efficiency Stackable Front-Load Washer (Merlot) ENERGY STAR', src: 'https://mobileimages.lowes.com/product/converted/887276/887276250946lg.jpg', price: '$649.00'}, 
    { id: 3, title: 'Samsung 4.5-cu ft High Efficiency Stackable Front-Load Washer (Merlot) ENERGY STAR', src: 'https://mobileimages.lowes.com/product/converted/887276/887276250946lg.jpg', price: '$649.00'}, 
    { id: 4, title: 'Samsung 4.5-cu ft High Efficiency Stackable Front-Load Washer (Merlot) ENERGY STAR', src: 'https://mobileimages.lowes.com/product/converted/887276/887276250946lg.jpg', price: '$649.00'}, 
    { id: 5, title: 'Samsung 4.5-cu ft High Efficiency Stackable Front-Load Washer (Merlot) ENERGY STAR', src: 'https://mobileimages.lowes.com/product/converted/887276/887276250946lg.jpg', price: '$649.00'}, 
    { id: 6, title: 'Samsung 4.5-cu ft High Efficiency Stackable Front-Load Washer (Merlot) ENERGY STAR', src: 'https://mobileimages.lowes.com/product/converted/887276/887276250946lg.jpg', price: '$649.00'}
];

var updateProducts = function(products) {
    productsList.length = 0;
    products.forEach(function (product, idx) {
        productsList.push(product);
    })
}

Vue.component('product-card', {
    props: ['product'],
    template: 
    '<div class="product">' +
    '    <img class="product-image" :src="product.src" alt="Product Image" \>' +
    '    <h6 class="product-title">{{ product.title }}</h6>' +
    '    <span class="product-price">{{ product.price }}</span>' +
    '</div>'
});

var products_window = new Vue({
    el: '#products-window',
    data: {
        products: productsList
    }
})
