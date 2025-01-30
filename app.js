const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const signupRouter = require('./routes/signup');
const createFormRouter = require('./routes/createForm');
const jobPostsAdminRouter = require('./routes/jobPosts');
const viewApplicationsRouter = require('./routes/viewApplications');
const evaluateCandidatesRouter = require('./routes/evaluateCandidates');
const candidateEvaluationsRouter = require('./routes/candidateEvaluations');
const logoutRouter = require('./routes/logout');
const interviewsRouter = require('./routes/interviews');
const reportsRouter = require('./routes/reports');
const candidateDashboardRouter = require('./routes/candidateDashboard');
const candidatesRouter = require('./routes/candidates');
const candidateApplicationsRouter = require('./routes/candidateApplications');
const hrDashboardRouter = require('./routes/hrDashboard');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin/create-form', createFormRouter);
app.use('/admin/job-posts', jobPostsAdminRouter);
app.use('/admin/candidates', candidatesRouter);
app.use('/admin/applications', viewApplicationsRouter);
app.use('/admin/evaluate-candidates', evaluateCandidatesRouter);
app.use('/admin/interviews', interviewsRouter);
app.use('/admin/reports', reportsRouter);
app.use('/admin/hr-dashboard', hrDashboardRouter);
app.use('/admin/interviews', interviewsRouter);

app.use('/candidate/dashboard', candidateDashboardRouter);
app.use('/candidate/applications', candidateApplicationsRouter);
app.use('/candidate', candidatesRouter);

app.use('/signup', signupRouter);
app.use('/users', usersRouter);
app.use('/', indexRouter);
app.use('/logout', logoutRouter);

app.use((req, res, next) => {
    next(createError(404));
});

app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.render('error');
});
app.use(express.static(path.join(__dirname, 'public')));

module.exports = app;
