select
  baserows.sourceid,
  baserows.periodid,
  baserows.attributeoptioncomboid,
  (
    select dv.dataelementid
    from datavalue dv
    where dv.sourceid = baserows.sourceid
      and dv.periodid = baserows.periodid
      and dv.attributeoptioncomboid = baserows.attributeoptioncomboid
      and dv.dataelementid not in (
        select de.dataelementid
        from dataelement de
        where de.name in (
          '<%= submissionDataElementName %>',
          '<%= approvalDataElementName %>'
        )
      )
    order by dv.lastupdated desc
    limit 1
  ) as dataelementid,
  (
    select dv.lastupdated
    from datavalue dv
    where dv.sourceid = baserows.sourceid
      and dv.periodid = baserows.periodid
      and dv.attributeoptioncomboid = baserows.attributeoptioncomboid
      and dv.dataelementid not in (
        select de.dataelementid
        from dataelement de
        where de.name in (
          '<%= submissionDataElementName %>',
          '<%= approvalDataElementName %>'
        )
      )
    order by dv.lastupdated desc
    limit 1
  ) as lastupdated
from (
  select distinct on (dv.sourceid, dv.periodid, dv.attributeoptioncomboid)
    dv.sourceid,
    dv.periodid,
    dv.attributeoptioncomboid
  from datavalue dv
  where dv.periodid in (
    select dv2.periodid
    from datavalue dv2
    where dv2.sourceid in (
      select ds.sourceid
      from datasetsource ds
      where ds.datasetid = (
        select d.datasetid
        from dataset d
        where d.uid = '<%= dataSetId %>'
      )
    )
      and dv2.dataelementid in (
        select dse.dataelementid
        from datasetelement dse
        where dse.datasetid = (
          select d.datasetid
          from dataset d
          where d.uid = '<%= dataSetId %>'
        )
      )
      and dv2.dataelementid not in (
        select de.dataelementid
        from dataelement de
        where de.name in (
          '<%= submissionDataElementName %>',
          '<%= approvalDataElementName %>'
        )
      )
      and dv2.periodid in (
        select p.periodid
        from period p
        join periodtype pt on pt.periodtypeid = p.periodtypeid
        where pt.name = 'Monthly'
          and p.startdate >= date_trunc('month', current_date) - interval '<%= months %> months'
          and p.startdate <  date_trunc('month', current_date) + interval '1 month'
      )
  )
    and dv.dataelementid in (
      select dv3.dataelementid
      from datavalue dv3
      where dv3.dataelementid in (
        select dse2.dataelementid
        from datasetelement dse2
        where dse2.datasetid = (
          select d.datasetid
          from dataset d
          where d.uid = '<%= dataSetId %>'
        )
      )
    )
    and dv.sourceid in (
      select ds2.sourceid
      from datasetsource ds2
      where ds2.datasetid = (
        select d.datasetid
        from dataset d
        where d.uid = '<%= dataSetId %>'
      )
    )
) as baserows;
