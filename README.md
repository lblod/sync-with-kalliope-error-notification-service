# sync-with-kalliope-error-notification-service

Microservice that harvests errors which happened while processing messages from Kalliope and creates associated emails.

##Installation

To add the service to your stack, add the following snippet to docker-compose.yml:

```
services:
  harvesting-import:
    image: lblod/sync-with-kalliope-error-notification:x.x.x
```

## Configuration

### Delta

```
  {
    match: {
      predicate: {
        type: 'uri',
        value: 'http://purl.org/pav/createdBy'
      },
      object: {
        type: 'uri',
        value: 'http://lblod.data.gift/services/berichtencentrum-sync-with-kalliope-service'
      }
    },
    callback: {
      url: 'http://sync-with-kalliope-error-notification/delta',
      method: 'POST'
    },
    options: {
      resourceFormat: 'v0.0.1',
      gracePeriod: 1000,
      ignoreFromSelf: true
    }
  }
```

### Environment variables

- SENDER
- RECIPIENT
- EMAIL_GRAPH 
- EMAIL_FOLDER
   
## REST API

### POST /delta

starts the conversion of the given errors into emails

Returns `204 NO-CONTENT` if no errors could be extracted.

Returns `200 SUCCESS` if the errors where successfully processes.

Returns `500 INTERNAL SERVER ERROR` if something went wrong while processing the errors.

## Model

### Used prefixes

Prefix | URI 
--- | --- 
ext: |  <http://mu.semte.ch/vocabularies/ext/>
rdfs:  | <http://www.w3.org/2000/01/rdf-schema#>
pav:  | <http://purl.org/pav/>
nmo: | <http://www.semanticdesktop.org/ontologies/2007/03/22/nmo#>

### Kalliope Sync Error

When processing messages arriving from Kalliope, errors can occur. This class is here to describe them.

#### Class

`ext:KalliopeSyncError`

#### Properties

 Name | Predicate | Range | Definition 
--- | --- | --- | ---
label | `rdfs:label` | `xsd:string` | Label of he error
errorMessage | `ext:errorMessage` | `xsd:string` | Full description of the error
processedMessage | `ext:processedMessage` | `xsd:anyURI` | Message being processed when the error occured
createdOn |`pav:createdOn`|`xsd:dateTime`| Datetime on which the error was created
createdBy |`pav:createdBy`|`rdfs:Resource`| Creator of the error, in this case <http://lblod.data.gift/services/berichtencentrum-sync-with-kalliope-service>

### Email

Once the errors have been picked up by this service, we will create an new email about it.

#### Class

`nmo:Email`

#### Properties

 Name | Predicate | Range | Definition 
--- | --- | --- | ---
folder | `nmo:isPartOf` | `nfo:Folder` | Folder where the email is stored
htmlContent |`nmo:htmlMessageContent`| `xsd:string` | HTML content
messageSubject |`nmo:messageSubject`| `xsd:string` | Subject of the email
emailTo |`nmo:emailTo`| `xsd:string` | Recipient of the email
messageFrom |`nmo:messageFrom`| `xsd:string` | Sender of the email
creator |`dct:creator`| `xsd:anyURI` | Creator of the email,  in this case <http://lblod.data.gift/services/sync-with-kalliope-error-notification-service>
