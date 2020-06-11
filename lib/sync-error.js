import {sparqlEscapeUri} from 'mu';

import {querySudo} from '@lblod/mu-auth-sudo';

export class SyncError {

  constructor(uri) {
    this.uri = uri;
  }

  async init() {
    const result = await querySudo(`
    PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX pav: <http://purl.org/pav/>

    SELECT ?label ?errorMessage ?processedMessage ?created
    WHERE {
        ${sparqlEscapeUri(this.uri)} a ext:KalliopeSyncError ;
               rdfs:label ?label ;
               ext:errorMessage ?errorMessage ;
               pav:createdOn ?created .

        OPTIONAL { ${sparqlEscapeUri(this.uri)} ext:processedMessage ?processedMessage . }
    }
  `)

    if (result.results.bindings.length) {
      this.label = result.results.bindings[0]['label'].value;
      this.errorMessage = result.results.bindings[0]['errorMessage'].value;
      this.processedMessage = result.results.bindings[0]['processedMessage'] ? result.results.bindings[0]['processedMessage'].value : null;
      this.created = new Date(result.results.bindings[0]['created'].value);
      return this;
    } else {
      console.log(`Could not initialize SyncError for resource <${this.uri}>`);
      return null;
    }
  }

}

export async function getSyncErrors(tasks) {
  let errors = [];
  for (let task of tasks) {
    if (await isSyncError(task)) {
      errors.push(task);
    }
  }
  return errors;
}

async function isSyncError(uri) {
  const result = await querySudo(`
    PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>

    SELECT ?error
    WHERE {
        ?error a ext:KalliopeSyncError .
    }
  `)
  if(result.results.bindings.length) {
    return result.results.bindings.map(binding => binding['error'].value).includes(uri);
  }
}