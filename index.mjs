import _ from 'lodash'
import f from 'promise-fs'
import neatCsv from 'neat-csv'
import Parser from 'json2csv'

let currentUniversitiesFile = './data/CurrentUniversities.csv';
let powerBiCertFile = './data/CertData.csv';
let domainLookup = {};

f.readFile(currentUniversitiesFile)
    .then(async universities => {
        //Parse domain -> university list and get lookup
        let parsedUniversities = await neatCsv(String(universities));

                _.forEach(parsedUniversities, university =>{
           let domains = university['Email Domains']
               .replace(/@/g, '')
               .replace(/\s/g, '')
               .split(',');

           if(domains.length > 0)
               _.forEach(domains, domain => {
                   if(!domainLookup[domain])
                       domainLookup[domain] = university['Account Name'];
               })
        });

        //Read and parse cert data
        f.readFile(powerBiCertFile)
            .then(async certs => {
                let parsedCerts = await neatCsv(String(certs));

                _.forEach(parsedCerts, cert =>{
                    cert.Domain = cert.Email.substring(cert.Email.lastIndexOf('@')+1);
                    cert.School = domainLookup[cert.Domain];
                });

                let parser = new Parser.Parser();
                let finalCsv = parser.parse(parsedCerts);

                f.writeFile('./data/FINAL_CertData.csv', finalCsv)
                    .then(() => console.log('PARSING COMPLETE\nSee FINAL_CertData.csv in the data folder.'))
                    .catch(err => console.log(err));
            })
            .catch(err => console.log(err));

        return null;
    })
    .catch(err => console.log(err));