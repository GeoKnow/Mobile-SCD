/**
 * Created by vukm on 10/12/15.
 */

angular.module('mobile-scm')
    .factory('supplierService', function() {

        function Supplier(uri, name, latitude, longitude, city, street, zipcode) {
            this.latitude = latitude;
            this.longitude = longitude;
            this.city = city;
            this.name = name;
            this.street = street;
            this.zipcode = zipcode;
            this.uri = uri;
            this.codename = this.uri.substring(this.uri.lastIndexOf('/')+1, this.uri.length);
            this.suppliers = [];
            this.parent = null;
            this.metrics = {};
            this.shippings = [];
            this.orders = [];
            this.hasIssues = false;
            this.numbers = [];
            if (this.name === "Fairphone_OS Supplier" || this.name === "Continental AG") {
                this.shippings = [
                    {
                        incomming: true,
                        other: "Supplier X",
                        quantity: 3,
                        product: "ProductX"
                    },
                    {
                        incomming: false,
                        other: "Supplier Y",
                        quantity: 4,
                        product: "ProductY"
                    }
                ];
            }
        }

        Supplier.prototype.updateHasIssues = function() {
            for (var name in this.metrics) {
                if (this.metrics[name].status !== 0) return this.hasIssues = true;
            }
            return this.hasIssues = false;
        };

        Supplier.prototype.removeNumber = function(index) {
            this.numbers.splice(index, 1);
        };

        Supplier.prototype.addNumber = function(value, type) {
            this.numbers.push({
                number: value,
                numberClean: value.replace(/ /g,'').replace(/-/g,'').replace(/\//g,'').replace(/\(/g,'').replace(/\)/g,''),
                type: type
            });
        };

        function Metric(name, unit, thresholdMax, thresholdMin, value) {
            this.name = name;
            this.unit = unit;
            this.thresholdMax = thresholdMax;
            this.thresholdMin = thresholdMin;
            this.value = value;
            this.status = this.violation();
        }

        /**
         * Checks if the metric is violated.
         * Returned value is 0 if the metric is not violated.
         * If the metric is violated, function returns difference between the value and the threshold
         * (positive if greater than max, negative if lesser then min)
         * @returns {number}
         */
        Metric.prototype.violation = function() {
            var res = this.value - this.thresholdMax;
            if (res>0) return res;
            res = this.value - this.thresholdMin;
            if (res<0) return res;
            return 0;
        };
        /**
         * Calls violate function and sets status to the returned value
         * @returns {number}
         */
        Metric.prototype.calcAndSetStatus = function() {
            return this.status = this.violation();
        };

        return {
            createSupplier: function(uri, name, latitude, longitude, city, street, zipcode) {
                var sup = new Supplier(uri, name, latitude, longitude, city, street, zipcode);
                var metrics = sup.metrics;
                metrics["Average Delivery Time"] = new Metric("Average Delivery Time", " days", 3, undefined, 2.55);
                metrics["Average Delay"] = new Metric("Average Delay", " days", 1, undefined, 0.61);
                metrics["Timeliness"] = new Metric("Timeliness", "%", undefined, 92, 92.6);
                metrics["Parts Due"] = new Metric("Parts Due", " parts", 500, undefined, 0);
                return sup;
            },
            createVirtualSupplier: function() {
                var sup = new Supplier("http://pupin.rs/geoknow/virtualSupplier", "Supply Chain Network");
                var metrics = sup.metrics;
                metrics["Troubled Suppliers"] = new Metric("Troubled Suppliers", "", 2, undefined, 0);
                return sup;
            }
        }
});