export const SQL_SCRIPTS = {
  dmv_wait_stats: `-- Get Wait Stats
SELECT TOP 10
    wait_type,
    wait_time_ms / 1000.0 AS WaitS,
    (wait_time_ms - signal_wait_time_ms) / 1000.0 AS ResourceS,
    signal_wait_time_ms / 1000.0 AS SignalS,
    waiting_tasks_count AS WaitCount,
    100.0 * wait_time_ms / SUM (wait_time_ms) OVER() AS Percentage,
    ROW_NUMBER() OVER(ORDER BY wait_time_ms DESC) AS RowNum
FROM sys.dm_os_wait_stats
WHERE wait_type NOT IN (
    'CLR_SEMAPHORE', 'LAZYWRITER_SLEEP', 'RESOURCE_QUEUE', 'SLEEP_TASK',
    'SLEEP_SYSTEMTASK', 'SQLTRACE_BUFFER_FLUSH', 'WAITFOR', 'LOGMGR_QUEUE',
    'CHECKPOINT_QUEUE', 'REQUEST_FOR_DEADLOCK_SEARCH', 'XE_TIMER_EVENT',
    'BROKER_TO_FLUSH', 'BROKER_TASK_STOP', 'CLR_MANUAL_EVENT',
    'CLR_AUTO_EVENT', 'DISPATCHER_QUEUE_SEMAPHORE', 'FT_IFTS_SCHEDULER_IDLE_WAIT',
    'XE_DISPATCHER_WAIT', 'XE_DISPATCHER_JOIN', 'BROKER_EVENTHANDLER',
    'TRACEWRITE', 'FT_IFTSHC_MUTEX', 'SQLTRACE_INCREMENTAL_FLUSH_SLEEP',
    'BROKER_RECEIVE_WAITFOR', 'ONDEMAND_TASK_QUEUE', 'DBMIRROR_EVENTS_QUEUE',
    'DBMIRRORING_CMD', 'BROKER_TRANSMITTER', 'SQLTRACE_WAIT_ENTRIES',
    'SLEEP_BPOOL_FLUSH', 'SQLTRACE_LOCK'
)
ORDER BY wait_time_ms DESC;`,

  query_store_top_queries: `-- Get Top Resource Consuming Queries from Query Store
SELECT TOP 20
    q.query_id,
    qt.query_sql_text,
    rs.count_executions,
    rs.avg_duration,
    rs.avg_cpu_time,
    rs.avg_logical_io_reads,
    rs.avg_physical_io_reads,
    rs.avg_query_max_used_memory
FROM sys.query_store_query_text AS qt
JOIN sys.query_store_query AS q
    ON qt.query_text_id = q.query_text_id
JOIN sys.query_store_plan AS p
    ON q.query_id = p.query_id
JOIN sys.query_store_runtime_stats AS rs
    ON p.plan_id = rs.plan_id
ORDER BY rs.avg_cpu_time DESC;`,

  extended_events_deadlocks: `-- Setup Extended Events for Deadlocks
CREATE EVENT SESSION [Deadlock_Monitor] ON SERVER 
ADD EVENT sqlserver.xml_deadlock_report(
    ACTION(sqlserver.client_app_name,sqlserver.client_hostname,sqlserver.database_name,sqlserver.sql_text,sqlserver.username))
ADD TARGET package0.ring_buffer(SET max_memory=(2048))
WITH (MAX_MEMORY=4096 KB,EVENT_RETENTION_MODE=ALLOW_SINGLE_EVENT_LOSS,MAX_DISPATCH_LATENCY=30 SECONDS,MAX_EVENT_SIZE=0 KB,MEMORY_PARTITION_MODE=NONE,TRACK_CAUSALITY=OFF,STARTUP_STATE=ON);
GO
ALTER EVENT SESSION [Deadlock_Monitor] ON SERVER STATE = START;
GO`
};
