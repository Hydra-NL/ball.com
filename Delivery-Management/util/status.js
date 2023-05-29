class Status {
    static Pending = 'Pending';
    static Inventory = 'Inventory';
    static Shipping = 'Shipping';
    static Delivered = 'Delivered';

    static Values = [
        this.Pending,
        this.Inventory,
        this.Shipping,
        this.Delivered
    ];

    static isValid(status) {
        return this.Values.includes(status);
    }
}

module.exports = Status