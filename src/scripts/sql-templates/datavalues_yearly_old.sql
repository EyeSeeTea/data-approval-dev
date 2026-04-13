SELECT
    baserows.sourceid,
    baserows.periodid,
    baserows.attributeoptioncomboid,
    (
        SELECT dv.dataelementid
        FROM datavalue dv
        WHERE dv.sourceid = baserows.sourceid
          AND dv.periodid = baserows.periodid
          AND dv.attributeoptioncomboid = baserows.attributeoptioncomboid
          AND dv.dataelementid NOT IN (
              SELECT de.dataelementid
              FROM dataelement de
              WHERE de.name IN ('<%= submissionDataElementName %>', '<%= approvalDataElementName %>')
          )
        ORDER BY dv.lastupdated DESC
        LIMIT 1
    ) AS dataelementid,
    (
        SELECT dv.lastupdated
        FROM datavalue dv
        WHERE dv.sourceid = baserows.sourceid
          AND dv.periodid = baserows.periodid
          AND dv.attributeoptioncomboid = baserows.attributeoptioncomboid

          AND dv.dataelementid NOT IN (
              SELECT de.dataelementid
              FROM dataelement de
              WHERE de.name IN ('<%= submissionDataElementName %>', '<%= approvalDataElementName %>')
          )
        ORDER BY dv.lastupdated DESC
        LIMIT 1
    ) AS lastupdated
FROM (
    SELECT DISTINCT ON (dv.sourceid, dv.periodid, dv.attributeoptioncomboid)
        dv.sourceid, dv.periodid, dv.attributeoptioncomboid
    FROM datavalue dv

    INNER JOIN datasetelement dse ON dv.dataelementid = dse.dataelementid

    INNER JOIN datasetsource dss ON dv.sourceid = dss.sourceid

    INNER JOIN period p ON dv.periodid = p.periodid

    INNER JOIN dataelement de ON dv.dataelementid = de.dataelementid
    WHERE
        dss.datasetid = (SELECT datasetid FROM dataset WHERE uid = '<%= dataSetId %>')
        AND dse.datasetid = (SELECT datasetid FROM dataset WHERE uid = '<%= dataSetId %>')

        AND p.periodtypeid = (SELECT periodtypeid FROM periodtype WHERE name = 'Yearly')

        AND CAST(SUBSTRING(CAST(p.startdate AS varchar), 1, 4) AS integer) BETWEEN 2000 AND 2019

        AND de.name NOT IN ('<%= submissionDataElementName %>', '<%= approvalDataElementName %>')
) AS baserows;
