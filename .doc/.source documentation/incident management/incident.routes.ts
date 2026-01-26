// backend/src/routes/incident.routes.ts
import { Router } from 'express';
import { incidentController } from '../controllers/incident.controller';
import { validateIncident } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/authorization.middleware';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Incident routes
router.post('/', 
  authorize(['BCP_MANAGER', 'INCIDENT_REPORTER']),
  validateIncident,
  incidentController.createIncident
);

router.get('/',
  authorize(['BCP_MANAGER', 'INCIDENT_RESPONDER', 'MANAGEMENT']),
  incidentController.getIncidents
);

router.get('/statistics',
  authorize(['BCP_MANAGER', 'MANAGEMENT']),
  incidentController.getIncidentStatistics
);

router.get('/export',
  authorize(['BCP_MANAGER', 'AUDITOR']),
  incidentController.exportIncidents
);

router.get('/:id',
  authorize(['BCP_MANAGER', 'INCIDENT_RESPONDER', 'MANAGEMENT']),
  incidentController.getIncidentById
);

router.put('/:id',
  authorize(['BCP_MANAGER', 'INCIDENT_RESPONDER']),
  validateIncident,
  incidentController.updateIncident
);

router.post('/:id/updates',
  authorize(['BCP_MANAGER', 'INCIDENT_RESPONDER']),
  incidentController.addIncidentUpdate
);

export default router;