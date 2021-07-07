const {google} = require('googleapis');
const keys = require('./keys.json');
const client = new google.auth.JWT(
    keys.client_email, 
    null, 
    keys.private_key, 
    ['https://www.googleapis.com/auth/spreadsheets']
);
client.authorize(function(err,tokens){

    if(err){
        console.log(err);
        return;
    } else {
        gsrun(client);
        console.log('Connected!')
    }
});

let engSoftware = new Array(24);

async function gsrun(cl){
    const gsapi = google.sheets({version:'v4',auth:cl});

    const opt1 = {spreadsheetId:'1iixX6rxExkG00LqU7DPOU12xHqZPKudh8sGXJksGgZ4',
    range:'engenharia_de_software!C4:C27'
    }; 
    let absences = await gsapi.spreadsheets.values.get(opt1); // Armazenando valores de faltas

    const opt2 = {spreadsheetId:'1iixX6rxExkG00LqU7DPOU12xHqZPKudh8sGXJksGgZ4',
    range:'engenharia_de_software!D4:D27'
    };
    let p1 = await gsapi.spreadsheets.values.get(opt2); // Armazenando valores de P1
 
    const opt3 = {spreadsheetId:'1iixX6rxExkG00LqU7DPOU12xHqZPKudh8sGXJksGgZ4',
    range:'engenharia_de_software!E4:E27'
    };
    let p2 = await gsapi.spreadsheets.values.get(opt3); // Armazenando valores de P2
        
    const opt4 = {spreadsheetId:'1iixX6rxExkG00LqU7DPOU12xHqZPKudh8sGXJksGgZ4',
    range:'engenharia_de_software!F4:F27'
    };
    let p3 = await gsapi.spreadsheets.values.get(opt4); // Armazenando valores de P3

    // Objeto para armazenar todas as variáveis
    for(i=0; i<24; i++){
        engSoftware[i] = {
            absences: parseInt(absences.data.values[i][0]),
            p1: parseInt(p1.data.values[i][0]),
            p2: parseInt(p2.data.values[i][0]),
            p3: parseInt(p3.data.values[i][0]),
            avg: 0,
            status: '',
            naf: 0
        };
    }

    average();
    setStatus();
    setResultsArray();
    console.log(engSoftware);

    const params = {
        spreadsheetId: '1iixX6rxExkG00LqU7DPOU12xHqZPKudh8sGXJksGgZ4',
        range: 'engenharia_de_software!G4:H27',
        valueInputOption: 'USER_ENTERED', 
        resource: {
            values: results
        }
    };
    await gsapi.spreadsheets.values.update(params);
}

//Função para calculo da média de cada aluno
function average(){
    for(i=0; i<24; i++){
        engSoftware[i].avg =  Math.ceil((engSoftware[i].p1+engSoftware[i].p2+engSoftware[i].p3)/3)
    }
}

//Função para as condições de aprovação do aluno
function setStatus(){
    for(i=0; i<24; i++){
        if(engSoftware[i].absences>15){
            engSoftware[i].status = 'Reprovado por falta';
            engSoftware[i].naf = '0';
        }else if(engSoftware[i].avg < 50){
            engSoftware[i].status = 'Reprovado por Nota';
            engSoftware[i].naf = '0';
        }else if(50 <= engSoftware[i].avg < 70){
            engSoftware[i].status = 'Exame Final';
            engSoftware[i].naf = 100 - engSoftware[i].avg;
        }else{
            engSoftware[i].status = 'Aprovado';
            engSoftware[i].naf = '0';
        }
    }
}

let results = new Array(24);

//Função para preencher a array results com os valores da situação e da nota final de aprovação de cada aluno
function setResultsArray(){
    for(i=0; i<24; i++){
        results[i] = [engSoftware[i].status, engSoftware[i].naf];
    }
}