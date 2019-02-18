export class HistoryUnit {

    date: Date;
    dateString: string;

    constructor(
        public systemId: string,
        public view: string,
        public target: string,
        public msg: string,
    ) {
        this.date = new Date();
        this.dateString = '';
    }


}
