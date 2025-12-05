SELECT dataset.name                                      AS dataset,
         dataset.uid                                       AS datasetuid,
         organisationunit.uid                              AS orgunituid,
         organisationunit.name                             AS orgunit,
         organisationunit.code                             AS orgunitcode,
         _periodstructure.yearly                              AS period,
         categoryoptioncombo.name                          AS attribute,
         dataapprovalworkflow.uid                          AS approvalworkflowuid,
         dataapprovalworkflow.name                         AS approvalworkflow,
         entries.attributeoptioncomboid                               AS att,
         entries.lastupdated                               AS lastupdatedvalue,
         entries.lastdatesubmited as lastdateofsubmission,
         entries.lastdateofapproval as lastdateofapproval,
         entries.diff as diff,
         completedatasetregistration.completed IS NOT NULL AS completed,
         dataapproval.accepted IS NOT NULL                 AS validated
  FROM ((SELECT distinct datavalue.periodid,
                datavalue.sourceid                         AS organisationunitid,
                datavalue.attributeoptioncomboid,
              (select datasetid from dataset where uid  ~ ('^' || replace('${dataSets}', '-', '|') || '$')) as datasetid,
              (select workflowid from dataset where uid  ~ ('^' || replace('${dataSets}', '-', '|') || '$') )as workflowid,
               (select max(dv1.lastupdated) from datavalue dv1 where dv1.dataelementid 
               not in (select dataelementid from dataelement where name='MAL - Submission date') 
               and dataelementid in (select dataelementid from datasetelement where datasetid in 
              (select datasetid from dataset where uid ~ ('^' || replace('${dataSets}', '-', '|') || '$') ))
                and dv1.sourceid = datavalue.sourceid and dv1.periodid=datavalue.periodid) as lastupdated,

 (select sum(diff.count) from ( select count(*) as count from datavalue dva where
   dva.dataelementid in (select dataelementid from dataelement where dataelementid in 
   (select dataelementid from datasetelement where datasetid in 
   (select datasetid from dataset where uid ~ ('^' || replace('${dataSets}', '-', '|') || '$') )))
   and 
   dva.lastupdated::timestamp without time zone > 
(select
     CASE WHEN ( select dv2.lastupdated  from datavalue dv2 where 
            dv2.dataelementid in (select de.dataelementid from dataelement de where de.name like 'MAL - Approval date-APVD') 
   and dv2.sourceid=datavalue.sourceid
   and dv2.periodid=datavalue.periodid 
   and dv2.attributeoptioncomboid= datavalue.attributeoptioncomboid
   and dv2.deleted = false ) IS NULL 
            THEN '1995-12-11'::timestamp without time zone 
            ELSE ( select dv2.lastupdated  from datavalue dv2 where 
            dv2.dataelementid in (select de.dataelementid from dataelement de where de.name like 'MAL - Approval date-APVD') 
   and dv2.sourceid=datavalue.sourceid
   and dv2.periodid=datavalue.periodid 
   and dv2.attributeoptioncomboid= datavalue.attributeoptioncomboid
   and dv2.deleted = false )::timestamp without time zone  
    END)


   and dva.sourceid=datavalue.sourceid
   and dva.periodid=datavalue.periodid
   and dva.attributeoptioncomboid= datavalue.attributeoptioncomboid
   and dva.deleted = false 
  GROUP BY dva.periodid, dva.sourceid, dva.attributeoptioncomboid, dva.dataelementid
  ) as diff ) as diff ,

                (select dv1.value from datavalue dv1 where dv1.dataelementid = (select dataelementid from dataelement where name='MAL - Submission date') and dv1.sourceid = datavalue.sourceid and dv1.periodid=datavalue.periodid) as lastdatesubmited,
                (select dv1.value from datavalue dv1 where dv1.dataelementid = (select dataelementid from dataelement where name='MAL - Approval date-APVD') and dv1.sourceid = datavalue.sourceid and dv1.periodid=datavalue.periodid) as lastdateofapproval
         FROM datavalue
                  JOIN datasetelement USING (dataelementid)
                  JOIN dataset USING (datasetid)
         /** TODO: Filter by DEs, remove totals **/       
WHERE dataset.uid ~ ('^' || replace('${dataSets}', '-', '|') || '$')
 and periodid in (select periodid from period where periodtypeid = (select periodtypeid from periodtype where name='Yearly'))
       and periodid in (select periodid from _periodstructure where _periodstructure.iso ~ ('^' || replace('${periods}', '-', '|') || '$'))
        /**  Filtered by orgunits in the dataset**/
      AND sourceid in ( select dss.sourceid from  datasetsource dss  where  dss.datasetid = dataset.datasetid) 
 and datavalue.dataelementid not in (select dataelementid from dataelement where  name='MAL - Submission date')


        GROUP BY datavalue.periodid, datavalue.sourceid, datavalue.attributeoptioncomboid , datavalue.lastupdated, datavalue.dataelementid
 having max(datavalue.lastupdated) = datavalue.lastupdated) AS entries
          INNER JOIN _periodstructure USING (periodid)
          INNER JOIN organisationunit USING (organisationunitid)
          INNER JOIN _orgunitstructure USING (organisationunitid)
          INNER JOIN dataapprovalworkflow USING (workflowid)
          INNER JOIN dataapprovallevel ON (dataapprovallevel.orgunitlevel = _orgunitstructure.level)
          INNER JOIN dataset USING (datasetid)
          INNER JOIN categoryoptioncombo ON (categoryoptioncombo.categoryoptioncomboid = entries.attributeoptioncomboid)
          LEFT JOIN completedatasetregistration ON ((completedatasetregistration.datasetid = entries.datasetid) AND
                                                    (completedatasetregistration.periodid = entries.periodid) AND
                                                    (completedatasetregistration.sourceid = entries.organisationunitid) AND                                              
 (completedatasetregistration.attributeoptioncomboid =
                                                     entries.attributeoptioncomboid))
          LEFT JOIN dataapproval ON ((dataapproval.workflowid = dataset.workflowid) AND
                                     (dataapproval.organisationunitid = entries.organisationunitid) AND
                                     (dataapproval.periodid = entries.periodid) AND
                                     (dataapproval.attributeoptioncomboid = entries.attributeoptioncomboid) AND
                                     (dataapproval.dataapprovallevelid = dataapprovallevel.dataapprovallevelid)))
WHERE organisationunit.path ~ (replace('${orgUnitRoot}', '-', '|'))
  AND organisationunit.uid ~ ('^' || replace('${orgUnits}', '-', '|') || '$')
  AND _periodstructure.yearly ~ ('^' || replace('${periods}', '-', '|') || '$')
  AND (completedatasetregistration.completed IS NOT NULL)::text ~ ('^' || replace('${completed}', '-', '|') || '$')
  AND (dataapproval.accepted IS NOT NULL)::text ~ ('^' || replace('${approved}', '-', '|') || '$')
 ORDER BY
    ${orderByColumn} ${orderByDirection},
     lastupdatedvalue desc,
     orgunit ASC,
     period DESC,
     dataset ASC,
     attribute ASC,
     completed ASC,
     validated ASC,
     lastupdatedvalue DESC,
     lastdateofsubmission ASC,
     lastdateofapproval ASC
