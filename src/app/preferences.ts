export class Preferences {
    url: string;
    type: string;
    cacheLifeTimeMs: number;
    aggregateOn: object;
    aggregationBannedLinks: Array<string>;
    detailsTargetId: string;
    eventChainTargetId: string;
    eventChainBannedLinks: Array<string>;
    eventChainCutAtEvent: Array<string>;
    eventChainGoUpStream: boolean;
    eventChainGoDownStream: boolean;
    eventChainTimeRelativeXAxis: boolean;
    streamBaseEvents: number;
    streamRefreshIntervalMs: number;
}
