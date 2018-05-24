export class Preferences {
    url: string;
    type: string;
    cacheLifeTimeMs: number;
    aggregateOn: object;
    detailsTargetId: string;
    eventChainTargetId: string;
    eventChainBannedLinks: Array<string>;
    eventChainGoUpStream: boolean;
    eventChainGoDownStream: boolean;
    eventChainMaxSteps: number;
    eventChainMaxConnections: number;
    eventChainTimeRelativeXAxis: boolean;
    streamBaseEvents: number;
    streamRefreshIntervalMs: number;
}
