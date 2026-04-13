select baserows.sourceid, baserows.periodid, baserows.attributeoptioncomboid, 
  (
    SELECT dataelementid
    FROM datavalue
    WHERE sourceid = baserows.sourceid
      AND periodid = baserows.periodid
      AND attributeoptioncomboid = baserows.attributeoptioncomboid
      AND dataelementid NOT IN (
        SELECT de.dataelementid
        FROM dataelement de
        WHERE de.name IN ('<%= submissionDataElementName %>', '<%= approvalDataElementName %>')
      )
    ORDER BY lastupdated DESC
    LIMIT 1
  ) AS dataelementid, 
  (
    SELECT lastupdated
    FROM datavalue
    WHERE sourceid = baserows.sourceid
      AND periodid = baserows.periodid
      AND attributeoptioncomboid = baserows.attributeoptioncomboid
      AND dataelementid NOT IN (
        SELECT de.dataelementid
        FROM dataelement de
        WHERE de.name IN ('<%= submissionDataElementName %>', '<%= approvalDataElementName %>')
      )
    ORDER BY lastupdated DESC
    LIMIT 1
  ) AS lastupdated
from (select      
  distinct on(datavalue.sourceid, datavalue.periodid, datavalue.attributeoptioncomboid) datavalue.sourceid, datavalue.periodid, datavalue.attributeoptioncomboid
from datavalue where periodid in (select periodid from datavalue where sourceid in (select sourceid from datasetsource where   datasetid = (select datasetid from   dataset where   uid = '<%= dataSetId %>'  )  )
  and dataelementid in (select   dataelementid from datasetelement where   datasetid = (select datasetid from   dataset where   uid = '<%= dataSetId %>'  )  )
  AND dataelementid NOT IN (
      SELECT de.dataelementid
      FROM dataelement de
      WHERE de.name IN ('<%= submissionDataElementName %>', '<%= approvalDataElementName %>')
    )
  and periodid in ( select       periodid     from       period     where       periodtypeid = (        select           periodtypeid         from           periodtype         where           name = 'Yearly'      )  )
  and periodid in (    select       periodid     from      period     where   SUBSTRING(CAST(period.startdate AS varchar), 1, 4) in (  	((date_part('year', current_date) - 5)::text),
	((date_part('year', current_date) - 4)::text),
	((date_part('year', current_date) - 3)::text),
	((date_part('year', current_date) - 2)::text),
	((date_part('year', current_date) - 1)::text) )  )   )
  and dataelementid in (select dataelementid from datavalue where dataelementid in (select   dataelementid from datasetelement where   datasetid = (select datasetid from   dataset where   uid = '<%= dataSetId %>'  )  ))
  and sourceid in (select sourceid from datasetsource where   datasetid = (select datasetid from   dataset where   uid = '<%= dataSetId %>'  )  )) as baserows
