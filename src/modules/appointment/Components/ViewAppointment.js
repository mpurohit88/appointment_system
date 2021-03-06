import React, {useState, useEffect, Fragment} from 'react';
import ReactDOM from 'react-dom';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, DatePicker} from '@material-ui/pickers';




// Component
import {generateTimingTable} from '../lib/TimingTable';
import {getDate} from '../../../utils/datetime';
import TimingBoard from './TimingBoard.js';
import ClientTable from './ClientTable.js';

// API
import AppointmentAPI from '../../../api/Appointment.js';


const useStyles = makeStyles(theme => ({
  textsize:{
    fontSize: theme.typography.pxToRem(12),
  },
  labelTitle: {
    fontWeight: theme.typography.fontWeightBold,
    fontSize: theme.typography.pxToRem(20),
    color: theme.palette.text.secondary,        
  },
}));

export default function ViewAppointment(props) {  
  const userData = props.data;
  const classes = useStyles();

  const [appointmentDate, setAppointmentDate] = useState(null);
  const [timingTable, setTimingTable] = useState(generateTimingTable);
  const [currentTimeslotList, setCurrentTimeslotList] = useState([]);
  const [appointedClientList, setAppointedClientList] = useState([]);


  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };    


  useEffect(() => {    
    getCurrentTimeslot();    
  },[]);

  const getCurrentTimeslot = async () => {
    try{
      const result = await AppointmentAPI.getCurrentTimeslot({ userId : userData.id });
      setCurrentTimeslotList(result.timeSlot);
      setFirstAvailableDate(result.timeSlot);
    }catch(e){
      console.log('getCurrentTimeslot Error...', e);
    }
  }

  const getAppointedClientList = async () => {
    try{
      const result = await AppointmentAPI.getAppointedClientList({ userId : userData.id, date : appointmentDate });      
      setAppointedClientList(result.clientList);
      setPage(0);
      setRowsPerPage(10);
    }catch(e){
      console.log('getAppointedClientList Error...', e);
    }
  }

  
  const setFirstAvailableDate = (timeSlot) => {
    const firstDate = (timeSlot.length > 0 ? timeSlot : []).find((data) => {
      return data.status === 1
    });
    setAppointmentDate(firstDate.date);    
  }


  const handleDateAvaibility = (date) => {
    const found = (currentTimeslotList.length > 0 ? currentTimeslotList : []).find((data) => {
      return data.date === getDate(date) && data.status === 1;
    })
    return found === undefined;
  }
  
  const handleDateChange = (date) => {
    setAppointmentDate(date);
  }

  
  const handleRecallTimingBoard = async () => {
    ReactDOM.render(
        <TimingBoard
          selectedDate = {getDate(appointmentDate)}
          currentTimeslotList={currentTimeslotList}
          timingTable = {timingTable}
          viewOnly = {true}
        />, 
        document.getElementById('timingBoard')
    );
    resetTiming();
  }

  
  const resetTiming = () => {
    timingTable.map((row) => {
      if(row.is_free === true){
        document.getElementById(row.time).style.backgroundColor =  'yellowgreen';
      }
    })
  }

  
  useEffect(() => {
    getAppointedClientList();
    handleRecallTimingBoard();
  },[appointmentDate]);

  
  return (  
    <Grid container spacing={4}  direction="row" justify="center" alignItems="center">
        <Grid item xs={12} sm={10}>
          <div style = {{display: 'flex'}}>            
            <Typography variant="h6" className={classes.labelTitle}> View Appointment </Typography>
          </div>
        </Grid>
        <Grid item xs={12} sm={10}>
          <Typography  className={classes.textHeading} htmlFor="appointment_date">Appointment Date</Typography>
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <DatePicker
              variant = "inline"              
              margin="dense"
              id="appointment_date"
              name="appointment_date"
              format="dd-MM-yyyy"
              placeholder="DD-MM-YYYY"
              disablePast = {true}
              value={appointmentDate}
              InputProps={{
                classes: {
                  input: classes.textsize,
                },                
              }}
              fullWidth
              onChange = { handleDateChange }
              shouldDisableDate = {(date) => { return handleDateAvaibility(date)}}
            />
          </MuiPickersUtilsProvider>
        </Grid>
        <Grid item xs={12} sm={8}>
          <Typography  className={classes.textHeading} htmlFor="">TIMING BOARD</Typography>
          <Paper style={{ width: '100%' }}>
            <div id = "timingBoard"></div>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={10}>
          <ClientTable ClientList = {appointedClientList} page={page} rowsPerPage={rowsPerPage} handleChangePage={handleChangePage} handleChangeRowsPerPage={handleChangeRowsPerPage}/>
        </Grid>
    </Grid>
  )
}