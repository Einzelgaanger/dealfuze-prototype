import { Router } from 'express';
import { FormController } from "./form.controller";
import { FormModule } from './form.module';
import { NestFactory } from '@nestjs/core';

const router = Router();
let formController: FormController;

// Initialize the controller
async function initializeController() {
  const app = await NestFactory.create(FormModule);
  formController = app.get(FormController);
}

// Initialize routes after controller is ready
initializeController().then(() => {
  router.get('/pipeline/:pipelineId', (req, res) => formController.getFormsByPipelineId(req, res));
  router.get('/:formId', (req, res) => formController.getFormById(req, res));
  router.put('/pipeline/:pipelineId', (req, res) => formController.updateForm(req, res));
  router.patch('/pipeline/:pipelineId/:formId/components', (req, res) => formController.patchFormComponents(req, res));
  router.post('/:formId/import', (req, res) => formController.importSubmissions(req, res));
}).catch(console.error);

export default router;
