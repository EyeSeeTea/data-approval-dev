SELECT
'${dataSets}' as datasetuid,
'${orgUnits}' as orgunituid,
'${periods}' as period,
sourceid,
periodid,
(select name from dataelement where dataelementid = datavalue.dataelementid) as dataelement,
datavalue.value as value,
datavalue.comment as comment,

(select dva.value from datavalue dva 
where dva.dataelementid=(select dataelementid from dataelement where name = CONCAT((select name from dataelement where dataelementid = datavalue.dataelementid), '-APVD')) 
and dva.sourceid=datavalue.sourceid 
and dva.attributeoptioncomboid= datavalue.attributeoptioncomboid
and dva.periodid=datavalue.periodid 
and dva.deleted = false 
and dva.categoryoptioncomboid = datavalue.categoryoptioncomboid
) as apvdvalue,
(select dva.comment from datavalue dva 
where dva.dataelementid=(select dataelementid from dataelement where name = CONCAT((select name from dataelement where dataelementid = datavalue.dataelementid), '-APVD')) 
and dva.sourceid=datavalue.sourceid 
and dva.attributeoptioncomboid= datavalue.attributeoptioncomboid
and dva.periodid=datavalue.periodid 
and dva.deleted = false 
and dva.categoryoptioncomboid = datavalue.categoryoptioncomboid
)as apvdcomment,
max(lastupdated) as lastupdated

        FROM datavalue
        WHERE 
		 datavalue.sourceid in (select organisationunitid from organisationunit where uid  ~ ('^' || replace('${orgUnits}', '-', '|') || '$'))
		and datavalue.periodid in (select periodid from _periodstructure where iso  ~ ('^' || replace('${periods}', '-', '|') || '$'))
and datavalue.dataelementid in ( select dse.dataelementid from  datasetelement dse  where  dse.datasetid = (select datasetid from dataset where uid  ~ ('^' || replace('${dataSets}', '-', '|') || '$')) )
and datavalue.deleted = false
and datavalue.dataelementid not in (select dataelementid from dataelement where name='MAL - Submission date')
and (datavalue.value != (select dva.value from datavalue dva 
where dva.dataelementid=(select dataelementid from dataelement where name = CONCAT((select name from dataelement where dataelementid = datavalue.dataelementid), '-APVD')) 
and dva.sourceid=datavalue.sourceid 
and dva.attributeoptioncomboid= datavalue.attributeoptioncomboid
and dva.periodid=datavalue.periodid 
and dva.deleted = false 
and dva.categoryoptioncomboid = datavalue.categoryoptioncomboid)
or (datavalue.value is not null and ((select dva.value from datavalue dva 
where dva.dataelementid=(select dataelementid from dataelement where name = CONCAT((select name from dataelement where dataelementid = datavalue.dataelementid), '-APVD')) 
and dva.sourceid=datavalue.sourceid 
and dva.attributeoptioncomboid= datavalue.attributeoptioncomboid
and dva.periodid=datavalue.periodid 
and dva.deleted = false 
and dva.categoryoptioncomboid = datavalue.categoryoptioncomboid) is null)))
GROUP BY datavalue.periodid, datavalue.sourceid, datavalue.attributeoptioncomboid, datavalue.dataelementid, datavalue.categoryoptioncomboid