import { inspect } from 'util';
import { MonitorServiceInterface } from '../../Core/Interfaces/Services/MonitorServiceInterface';

export class MonitorService implements MonitorServiceInterface {
    private transactionName: string;
    private contextData: { [key: string]: any } = {};
    private logs: string[] = [];
    private published = false;
    private preventPublish = false;

    constructor(transactionName?: string) {

        if (!transactionName) {
            transactionName = 'Transaction in ' + new Date().toISOString() + ' ' + Math.random();
        }

        this.transactionName = transactionName;
    }

    public setTransactionName(transactionName: string) {
        this.transactionName = transactionName;
    }

    public context(key: string, value: any) {
        this.contextData[key] = value;
    }

    public log(...message: any[]): void {
        const date = new Date();
        date.setHours(date.getHours() - 3);
        const prefix = date.toISOString().replace('T', ' ').replace('Z', '') + ': ';

        let messageString: string = '';

        for (const m of message) {
            if (typeof m === 'object') {
                messageString += inspect(m, { depth: null }) + ' ';
            } else {
                messageString += m + ' ';
            }

        }

        this.logs.push(prefix + messageString);
        console.log(prefix, messageString);
    }

    public error(value: any) {
        this.context(`Error`, value);
    }

    public preventPublishing() {
        this.preventPublish = true;
    }

    public async publish() {
        if (this.preventPublish) {
            this.log('Prevented publishing');
            return;
        }

        if (this.published) {
            this.log('Already published');
            return;
        }

        this.published = true;

        let output = `\n**Transaction: ** ${this.transactionName}`;

        if (Object.keys(this.contextData).length > 0) {
            for (const key in this.contextData) {
                output += `\n**${key}: **\n\`\`\`json\n${inspect(this.contextData[key], { depth: null })}\n\`\`\``;
            }
        }

        if (this.logs.length > 0) {
            output += '\n**Logs: **\n```' + this.logs.join('\n') + '```\n\n';
        }

        this.sendToAPI(output);
    }

    private sendToAPI(text: string) {
        const API_URL = process.env.MONITOR_DEBUG_URL || '';

        const payload = {
            content: text
        };

        fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
    }
}