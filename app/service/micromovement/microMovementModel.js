/*
Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
angular.module('unionvmsWeb').factory('MicroMovement', function() {
    function MicroMovement() {
        this.asset = undefined;
        this.guid = undefined;
        this.heading = undefined;
        this.timestamp = undefined;

        this.location = {
            longitude: undefined,
            latitude: undefined
        };
    }

    MicroMovement.fromJson = function(data) {
        var microMovement = new MicroMovement();
        microMovement.asset = data.asset;
        microMovement.guid = data.guid;
        microMovement.heading = data.heading;
        microMovement.timestamp = data.timestamp;

        if (data.location) {
            microMovement.location.latitude = data.location.latitude !== null ? data.location.latitude : undefined;
            microMovement.location.longitude = data.location.longitude !== null ? data.location.longitude : undefined;
        }

        return microMovement;
    };

    MicroMovement.prototype.getDto = function() {
        var data = {};
        data.asset = this.asset;
        data.guid = this.guid;
        data.heading = this.heading;
        data.timestamp = this.timestamp;

        data.location = {
            longitude: this.location.longitude,
            latitude: this.location.latitude
        };

        return data;
    };

    MicroMovement.prototype.copy = function() {
        var copy = new MicroMovement();
        copy.asset = this.asset;
        copy.guid = this.guid;
        copy.heading = this.heading;
        copy.timestamp = this.timestamp;

        if (this.location) {
            copy.location.latitude = this.location.latitude !== null ? this.location.latitude : undefined;
            copy.location.longitude = this.location.longitude !== null ? this.location.longitude : undefined;
        }

        return copy;
    };

    MicroMovement.prototype.isEqualMovement = function(item) {
        return item.guid === this.guid;
    };

    return MicroMovement;

});
