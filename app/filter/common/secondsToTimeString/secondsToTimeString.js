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
angular.module('unionvmsWeb').filter('secondsToTimeString', function(locale) {
  return function(seconds) {
    if(angular.isUndefined(seconds)){
        return "";
    }

    //Less than 60 seconds
    if(seconds < 60){
        return seconds +" " +locale.getString('common.time_second_short');
    }
    //Return hour and minutes, e.g. 2h 45 min
    var hours = Math.floor(seconds / 3600);
    var minutes = Math.floor((seconds % 3600) / 60);
    var text = "";
    if(hours > 0){
        text += hours + locale.getString('common.time_hour_short');
    }
    if(minutes > 0){
        text += (text.length === 0) ? "" : " ";
        text += minutes + " " +locale.getString('common.time_minute_short');
    }
    return text;
 };
});