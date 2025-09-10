import React from 'react';
import { Routes, Route } from 'react-router-dom';

const WorkflowsOverview = React.lazy(() => import('./pages/WorkflowsOverview'));
const WorkflowsList = React.lazy(() => import('./pages/WorkflowsList'));
const WorkflowBuilder = React.lazy(() => import('./pages/WorkflowBuilder'));
const WorkflowTemplates = React.lazy(() => import('./pages/WorkflowTemplates'));
const WorkflowExecutions = React.lazy(() => import('./pages/WorkflowExecutions'));
const WorkflowAnalytics = React.lazy(() => import('./pages/WorkflowAnalytics'));

const WorkflowsRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={<WorkflowsOverview />} />
      <Route path="list" element={<WorkflowsList />} />
      <Route path="builder" element={<WorkflowBuilder />} />
      <Route path="builder/:id" element={<WorkflowBuilder />} />
      <Route path="templates" element={<WorkflowTemplates />} />
      <Route path="executions" element={<WorkflowExecutions />} />
      <Route path="analytics" element={<WorkflowAnalytics />} />
    </Routes>
  );
};

export default WorkflowsRoutes;