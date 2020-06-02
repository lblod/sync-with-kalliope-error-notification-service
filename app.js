import {app, errorHandler} from 'mu';
import {Delta} from "./lib/delta";
import {getSyncErrors, SyncError} from "./lib/sync-error";
import {mail} from "./lib/email";
import bodyParser from 'body-parser';

const TRIGGER_PREDICATE = 'http://purl.org/pav/createdBy'
const TRIGGER_OBJECT = 'http://lblod.data.gift/services/berichtencentrum-sync-with-kalliope-service';

app.use(bodyParser.json({
  type: function (req) {
    return /^application\/json/.test(req.get('content-type'));
  }
}));


app.get('/', function (req, res) {
  res.send('Hello sync-with-kalliope-error-notification-service');
});

app.post('/delta', async function (req, res, next) {
  try {
    const tasks = new Delta(req.body).getInsertsFor(TRIGGER_PREDICATE, TRIGGER_OBJECT);
    if (!tasks.length) {
      console.log('Delta dit not contain any tasks for me to process, awaiting the next batch!');
      return res.status(204).send();
    }
    const errors = await getSyncErrors(tasks)
    if (!errors.length) {
      console.log('Delta dit not contain any kalliope-sync-errors for me to process, awaiting the next batch!');
      return res.status(204).send();
    }

    console.log("Starting the creations of emails ...");
    for (let error of errors) {
      try {
        const syncError = await new SyncError(error).init();
        if (syncError) {
          console.log(`Constructing email for sync-error <${error}>`)
          await mail(syncError);
        }
      } catch (e) {
        console.log(`Something went wrong while constructing email for sync-error <${syncError.uri}>`);
        console.error(e);
      }
    }
    console.log('Successfully processed tasks, awaiting the next batch!');
    return res.status(200).send().end();
  } catch (e) {
    console.log(`Something unexpected went wrong while handling tasks: ${tasks.join(`, `)}`);
    console.log(e);
    return next(e);
  }
})

app.use(errorHandler);