/**
 * Created by vukm on 10/12/15.
 */

angular.module('mobile-scm')
    .factory('supplierService', function() {

        var curDate = new Date();
        var curYear = curDate.getFullYear();
        var curMonth = curDate.getMonth();
        if (curMonth < 10) curMonth = '0' + curMonth;
        var curDay = curDate.getDate();
        if (curDay < 10) curDay = '0' + curDay;
        var curDateString = curYear + '-' + curMonth + '-' + curDay;

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
            //if (this.name === "Fairphone_OS Supplier" || this.name === "Continental AG") {
            //    this.shippings = [
            //        {
            //            incomming: true,
            //            other: "Supplier X",
            //            quantity: 3,
            //            product: "ProductX"
            //        },
            //        {
            //            incomming: false,
            //            other: "Supplier Y",
            //            quantity: 4,
            //            product: "ProductY"
            //        }
            //    ];
            //}
        }

        var virtualSupplier = {};

        Supplier.prototype.updateHasIssues = function() {
            var oldStatus = this.hasIssues;
            var newStatus = false;
            for (var name in this.metrics) {
                if (this.metrics[name].status !== 0) {
                    newStatus = true;
                    break;
                }
            }
            if (!oldStatus && newStatus) virtualSupplier.metrics["Troubled Suppliers"].value++;
            else if (oldStatus && !newStatus) virtualSupplier.metrics["Troubled Suppliers"].value--;
            return this.hasIssues = newStatus;
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

        Supplier.prototype.addOrder = function(o) {
            if (o.connectionSourceId === this.codename || o.connectionTargetId === this.codename) {
                this.orders.push(o);
                // TODO: additional logic, like removing older orders
                if (this.orders.length === 10) this.orders.shift();
            }
        };

        Supplier.prototype.addShipping = function(s) {
            if (s.connectionSourceId === this.codename || s.connectionTargetId === this.codename) {
                this.shippings.push(s);
                // TODO: additional logic, like removing older shippings
                if (this.shippings.length === 10) this.shippings.shift();
            }
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

        var contacts = [
            {
                displayName: 'Pera',
                phoneNumbers: [
                    {
                        type: 'home',
                        value: '063 332-381'
                    }
                ]
            },
            {
                displayName: 'Zika',
                phoneNumbers: [
                    {
                        type: 'home',
                        value: '061 6345-789'
                    },
                    {
                        type: 'work',
                        value: '063/332-381'
                    }
                ]
            }
        ];

        function getContacts(cbFunc) {
            function setContactsAndCall(c) {
                var i=0;
                while (i < c.length) {
                    if (typeof c[i].phoneNumbers === 'undefined' || c[i].phoneNumbers === null || c[i].phoneNumbers.length === 0) {
                        c.splice(i,1);
                    } else {
                        i++;
                    }
                }
                contacts = c;
                console.log('Setting contacts to: ');
                console.log(c);
                cbFunc(contacts);
            }

            if (typeof cordova !== 'undefined' && typeof navigator.contacts !== 'undefined' && contacts.length < 5) {
                navigator.contacts.find([/*navigator.contacts.fieldType.displayName, navigator.contacts.fieldType.name, */navigator.contacts.fieldType.phoneNumbers],
                    setContactsAndCall, function() { $log.error('There was an error while acquiring contacts')});
            } else {
                cbFunc(contacts);
            }
        }

        var orders = [];
        var shippings = [];
        var ordersMap = {};
        var shippingsMap = {};

        function getDateBroken(date) {
            var dateObject = {
                date: null,
                time: null,
                zone: null
            };
            var tPos = date.indexOf('T');
            var zPos = date.indexOf('+');
            if (zPos < 0) zPos = date.indexOf('-');
            var curEnd = date.length;

            if (zPos >= 0) {
                dateObject.zone = date.substring(zPos);
                curEnd = zPos;
            }
            if (tPos >= 0) {
                dateObject.time = date.substring(tPos + 1, curEnd);
                curEnd = tPos;
            }
            dateObject.date = date.substring(0, curEnd);
            return dateObject;
        }

        function prettyDate(dateBroken) {
            if (dateBroken.date === curDateString) return dateBroken.time + dateBroken.zone;
            else return dateBroken.date;
        }

        function addOrder(o) {
            // status values: 0 - in progress; 1 - overdue; 2 - completed
            o.status = 0;
            if (typeof o.product === 'undefined') o.product = "ProductX";
            o.remaining = o.count;
            o.tracked = false;
            o.dateBroken = getDateBroken(o.date);
            o.dueDateBroken = getDateBroken(o.dueDate);
            o.reduceCount = function(cnt) {
                this.remaining -= cnt;
                if (this.remaining < 1) this.status = 2;
            };
            o.prettyDate = function() {
                return prettyDate(this.dateBroken);
            };
            o.prettyDueDate = function() {
                return prettyDate(this.dueDateBroken);
            };
            orders.push(o);
            ordersMap[o.uri] = o;
            return o;
        }

        function addShipping(s) {
            if (typeof s.product === 'undefined') s.product = "ProductX";
            s.tracked = false;
            s.dateBroken = getDateBroken(s.date);
            s.prettyDate = function() {
                return prettyDate(this.dateBroken);
            };
            var order = ordersMap[s.order];
            if (order) order.reduceCount(s.count);
            shippings.push(s);
            shippingsMap[s.uri] = s;
            return s;
        }

        function setCurDateString(dateString) {
            curDateString = dateString;
            for (var i=0; i<orders.length; i++) {
                var curOrder = orders[i];
                if (curOrder.remaining > 0 && curOrder.dueDateBroken.date < dateString) {
                    curOrder.status = 1;
                }
            }
        }

        function getOrderByUri(orderUri) {
            return ordersMap[orderUri];
        }

        return {
            createSupplier: function(uri, name, latitude, longitude, city, street, zipcode) {
                if (typeof uri != "string") {
                    var sup = new Supplier(uri.uri, uri.name, uri.latitude, uri.longitude, uri.city, uri.street, uri.zipcode);
                    var metrics = sup.metrics;
                    metrics["Average Delivery Time"] = new Metric("Average Delivery Time", " days", 3, undefined, 2.55);
                    metrics["Average Delay"] = new Metric("Average Delay", " days", 1, undefined, 0.61);
                    metrics["Timeliness"] = new Metric("Timeliness", "%", undefined, 92, 92.6);
                    metrics["Parts Due"] = new Metric("Parts Due", " parts", 500, undefined, 0);
                    // TODO: read numbers, maybe also orders and shipments
                    return sup;
                } else {
                    var sup = new Supplier(uri, name, latitude, longitude, city, street, zipcode);
                    var metrics = sup.metrics;
                    metrics["Average Delivery Time"] = new Metric("Average Delivery Time", " days", 3, undefined, 2.55);
                    metrics["Average Delay"] = new Metric("Average Delay", " days", 1, undefined, 0.61);
                    metrics["Timeliness"] = new Metric("Timeliness", "%", undefined, 92, 92.6);
                    metrics["Parts Due"] = new Metric("Parts Due", " parts", 500, undefined, 0);
                    return sup;
                }
            },
            createVirtualSupplier: function() {
                var sup = new Supplier("http://pupin.rs/geoknow/virtualSupplier", "Supply Chain Network");
                var metrics = sup.metrics;
                metrics["Troubled Suppliers"] = new Metric("Troubled Suppliers", "", 2, undefined, 0);
                metrics["Average Delivery Time"] = new Metric("Average Delivery Time", " days", undefined, undefined, 2.55);
                metrics["Average Delay"] = new Metric("Average Delay", " days", undefined, undefined, 0.61);
                metrics["Total Parts Due"] = new Metric("Total Parts Due", "", undefined, undefined, 0);
                metrics["Timeliness"] = new Metric("Timeliness", "%", undefined, undefined, 92.6);
                virtualSupplier = sup; //TODO it would be better to have singleton virtual supplier and to require parent in createSupplier method
                return sup;
            },
            getContacts: getContacts,
            addOrder: addOrder,
            addShipping: addShipping,
            setCurDateString: setCurDateString,
            getOrders: function() { return orders; },
            getShippings: function() { return shippings; },
            clearOrders: function() { while (orders.length > 0) orders.pop(); },
            clearShippings: function() { while (shippings.length > 0) shippings.pop(); },
            getOrderByUri: getOrderByUri
        }
});