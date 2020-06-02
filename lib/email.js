import {uuid, sparqlEscapeUri, sparqlEscapeString} from 'mu';
import fs from 'fs-extra';
import handlebars from 'handlebars';
import {querySudo as query} from '@lblod/mu-auth-sudo';

const CREATOR = 'http://lblod.data.gift/services/sync-with-kalliope-error-notification-service';
const MAIL_SUBJECT = 'An error accord while processing your request on Kalliope';
const TEMPLATE = '/usr/src/app/app/template/template.hbs';

// TODO
const SENDER = process.env.MESSAGE_FROM || '';
const RECIPIENT = process.env.MESSAGE_TO || '';
const EMAIL_GRAPH = process.env.EMAIL_GRAPH || 'http://mu.semte.ch/graphs/public';
const EMAIL_FOLDER = process.env.EMAIL_FOLDER || '';

export async function mail(syncError) {
  // TODO make the template more solid
  const template = handlebars.compile(fs.readFileSync(TEMPLATE, 'utf8'));
  const html = template({
    date: syncError.created,
    message: syncError.label,
    stacktrace: syncError.errorMessage,
    uri:syncError.processedMessage
  })
  let emailUUID = uuid();
  await query(`
  PREFIX nmo: <http://nomisma.org/ontology.rdf#>
  PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
  PREFIX dct: <http://purl.org/dc/terms/>
  
  INSERT DATA {
    GRAPH ${sparqlEscapeUri(EMAIL_GRAPH)} {
        ${sparqlEscapeUri(`http://data.lblod.info/id/emails/${emailUUID}`)} a <http://www.semanticdesktop.org/ontologies/2007/03/22/nmo#Email>;
        mu:uuid ${sparqlEscapeString(emailUUID)};
        nmo:isPartOf ${sparqlEscapeUri(EMAIL_FOLDER)};
        nmo:htmlMessageContent ${sparqlEscapeString(html)};
        nmo:messageSubject ${sparqlEscapeString(MAIL_SUBJECT)};
        nmo:emailTo ${sparqlEscapeString(RECIPIENT)};
        nmo:messageFrom ${sparqlEscapeString(SENDER)};
        dct:creator ${sparqlEscapeUri(CREATOR)}.
    }
  }`);
}