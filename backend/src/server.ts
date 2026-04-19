import { app } from './app.js';
import { env } from './config/env.js';
import { connectDatabase } from './config/db.js';
import { startOverdueJob } from './jobs/overdue.job.js';

async function bootstrap(): Promise<void> {
  await connectDatabase();
  startOverdueJob();
  app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
