module.exports = function Cart(oldCart) {
    this.items = oldCart.items || {};
    this.totalQty = oldCart.totalQty || 0;
    this.totalPrice = oldCart.totalPrice || 0;


    this.add = function (id, item) {
        var storedItems = this.items[id];
        if (!storedItems) {
            storedItems = this.items[id] = {item: item, price: 0, qty: 0}
        }
        storedItems.qty++;
        storedItems.price = storedItems.item.price * storedItems.qty;
        this.totalQty++;
        this.totalPrice += storedItems.item.price
    };

    this.generateArray = function() {
        var arr = [];
        for(var id in this.items){
            arr.push(this.items[id]);
        }
        return arr;
    }
};