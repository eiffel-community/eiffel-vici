export class HistoryUnit {

    date: Date;

    constructor(
        public systemId: string,
        public view: string,
        public target: string,
        public msg: string,
    ) {
        this.date = new Date()
    }


}
