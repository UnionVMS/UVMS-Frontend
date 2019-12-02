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
angular.module('auth.jwt', [])
	.service('jwtHelper', function() {
		this.urlBase64Decode = function(str) {
			var output = str.replace(/-/g, '+').replace(/_/g, '/');
			switch (output.length % 4) {
				case 0: { break; }
				case 2: { output += '=='; break; }
				case 3: { output += '='; break; }
				default: {
					throw 'Illegal base64url string!';
				}
			}
			return decodeURIComponent(encodeURI(window.atob(output))); //polifyll https://github.com/davidchambers/Base64.js
		};

		this.decodeToken = function(token) {
			var parts = token.split('.');
			if (parts.length !== 3) {
				throw new Error('JWT must have 3 parts');
			}

			var decoded = this.urlBase64Decode(parts[1]);
			if (!decoded) {
				throw new Error('Cannot decode the token');
			}

			return JSON.parse(decoded);
		};

		this.getTokenExpirationDate = function(token) {
			var decoded;
			decoded = this.decodeToken(token);

			if(typeof decoded.exp === "undefined") {
				return null;
			}

			var d = new Date(0); // The 0 here is the key, which sets the date to the epoch
			d.setUTCSeconds(decoded.exp);
			return d;
		};

		this.isTokenExpired = function(token, offsetSeconds) {
			var d = this.getTokenExpirationDate(token);
			offsetSeconds = offsetSeconds || 0;
			if (d === null) {
				return false;
			}
			var isValid = d.valueOf() > (new Date().valueOf() + (offsetSeconds * 1000));
			// Token expired?
			return !isValid;
		};
	});