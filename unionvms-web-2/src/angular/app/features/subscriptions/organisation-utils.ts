import {Organisation} from "./organisation.model";
import {EndPoint} from "./endpoint.model";
import {CommunicationChannel} from "./communication-channel.model";

export function sortOrganisations(organisations: Organisation[]) {
  organisations.sort(function(a,b){
    let aName = a.parent ? a.parent + ' ' + a.name : a.name;
    let bName = b.parent ? b.parent + ' ' + b.name : b.name;
    return aName.localeCompare(bName);
  })
}

export function sortEndpoints(endpoints: EndPoint[]) {
  endpoints.sort(function(a,b) {
    return a.name.localeCompare(b.name);
  });
}

export function sortCommunicationChannels(channels: CommunicationChannel[]) {
  channels.sort(function(a,b){
    return a.dataflow.localeCompare(b.dataflow);
  })
}
