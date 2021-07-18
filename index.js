const cheerio = require('cheerio');
const fs = require('fs');
const request = require('request-promise');
const randomWords = require('random-words');
const config = require('./config.json');
const chalk = require('chalk');
const setTerminalTitle = require('set-terminal-title');
const { ansi } = require('chalk');
require('console-stamp')(console, { pattern: 'HH:MM:ss.l' });

const proxies = [];
fs.readFileSync(__dirname + '/proxy.txt', 'utf-8')
        .split(/\r?\n/)
        .forEach((line) => proxies.push(line));
console.log(chalk.green(" [+] Welcome to the Github account name availability checker."));

var tName = 0;
var aName = 0;
var errName = 0;

class Task {
    constructor(props) {
        this.id = props.id;
        this.accName = randomWords();

        if (!proxies.length) {
			console.error(`(ID ${this.id}) Out of Proxies!`);
			process.exit(1);
		}

        this.rawProxy = proxies[Math.floor(Math.random() * proxies.length)];
		this.proxy = this.formatProxy(this.rawProxy);

        this.checkName()
    }
    sleep(ms) {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve();
			}, ms);
		});
	}
	formatProxy(proxy) {
		if (!proxy || proxy.replace(/\s/g, '') == '') return null;
		let proxySplit = proxy.split(':');

		if (proxySplit.length > 2) {
			return (
				'http://' +
				proxySplit[2] +
				':' +
				proxySplit[3] +
				'@' +
				proxySplit[0] +
				':' +
				proxySplit[1]
			);
		} else {
			return 'http://' + proxySplit[0] + ':' + proxySplit[1];
		}
	}

    async checkName() {
        try {
            const response = await request({
                url: `https://github.com/${this.accName}`,
                method: 'GET',
                headers: {
                    accept:
                        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                        'accept-encoding': 'gzip, deflate, br',
                        'accept-language': 'en-US,en;q=0.9',
                        'cache-control': 'no-cache',

                    'sec-ch-ua': ' " Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91" ',
                    'sec-ch-ua-mobile': '?0',
                    'sec-fetch-dest': 'document',
                    'sec-fetch-mode': 'navigate',
                    'sec-fetch-site': 'none',
                    'sec-fetch-user': '?1',
                    'upgrade-insecure-requests': '1',
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                },
                proxy: this.proxy,
                gzip: true,
                resolveWithFullResponse: true,
                followAllRedirects: true,
            });
            if (response.statusCode == 404) {
                console.log(chalk.green(` [Github] [ID: ${this.id}]     `) +   `Account name available! Name used: ${this.accName}. Proxy used: ${this.proxy}`);
                ++aName;
            }
            else if (response.statusCode != 404) {
                console.log(chalk.red(` [Github] [ID: ${this.id}]       `) +   `Account taken. Name used: ${this.accName}. Proxy used: ${this.proxy}`);
                ++tName;
            }
        } catch (err) {
            console.log(chalk.yellow(` [Github] [ID: ${this.id}]       `) + `Error has occured! Proxy used: ${this.proxy}`);
                ++errName;
            
			if (!proxies.length) {
				console.error(`(ID ${this.id}) Out of Proxies!`);
				process.exit(1);
			}
            this.sleep(2500);
        }
        setTerminalTitle(`GitHub Name Search by: Inauthentic | Tasks: (${config.tasks}) Taken: (${tName}) Available: (${aName}) Errors: (${errName}) `, { verbose: false });
    }
}
for (let i = 0; i < config.tasks; i++) {
    new Task({ id: i + 1});
}