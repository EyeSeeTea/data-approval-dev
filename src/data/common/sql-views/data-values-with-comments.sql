select
    *
from
    (
        SELECT
            -- Returns UNION of two sets:
            --   * Data values with comments.
            --   * Data values with related comment stored in another data value. 
            --
            -- Notes:
            --   * Use JSON constant to get order and section of a (dataSet, dataElement, coc) row
            --
            datasetid,
            datasetname,
            dataelementid,
            dataelementname,
            (
                (
                    SELECT
                        description :: jsonb
                    FROM
                        constant
                    WHERE
                        code = 'NHWA_COMMENTS'
                ) -> 'sections' ->> (
                    datasetid || '.' || dataelementId || '.' || cocid
                )
            ) as section,
            cocid,
            cocname,
            value,
            comment,
            lastupdated,
            storedby,
            orgunit,
            period,
            COALESCE(
                (
                    (
                        SELECT
                            description :: jsonb
                        FROM
                            constant
                        WHERE
                            code = 'NHWA_COMMENTS'
                    ) -> 'order' ->> (
                        datasetid || '.' || dataelementId || '.' || cocid
                    )
                ) :: int,
                999999
            ) as dataelementorder
        FROM
            (
                SELECT
                    organisationunit.path AS organisationunitpath,
                    dataset.uid as datasetid,
                    dataset.name AS datasetname,
                    dataelement.uid AS dataelementid,
                    dataelement.name AS dataelementname,
                    categoryoptioncombo.uid AS cocid,
                    categoryoptioncombo.name AS cocname,
                    datavalue.value AS value,
                    datavalue.comment AS comment,
                    datavalue.lastupdated AS lastupdated,
                    datavalue.storedby AS storedby,
                    organisationunit.name AS orgunit,
                    _periodstructure.iso AS period
                FROM
                    datavalue
                    INNER JOIN dataelement USING (dataelementid)
                    INNER JOIN categoryoptioncombo USING (categoryoptioncomboid)
                    INNER JOIN organisationunit ON (
                        organisationunit.organisationunitid = datavalue.sourceid
                    )
                    INNER JOIN _periodstructure USING (periodid)
                    INNER JOIN datasetelement USING (dataelementid)
                    INNER JOIN dataset USING (datasetid)
                WHERE
                    dataset.uid ~ ('^' || replace('${dataSetIds}', '-', '|') || '$')
                    AND organisationunit.path ~ (replace('${orgUnitIds}', '-', '|'))
                    AND _periodstructure.iso ~ ('^' || replace('${periods}', '-', '|') || '$')
                    AND datavalue.COMMENT IS NOT NULL
                    AND datavalue.value != datavalue.comment
                UNION
                SELECT
                    organisationunit.path AS organisationunitpath,
                    dataset.uid as datasetid,
                    dataset.name AS datasetname,
                    dataelement.uid AS dataelementid,
                    dataelement.name AS dataelementname,
                    categoryoptioncombo.uid AS cocid,
                    categoryoptioncombo.name AS cocname,
                    datavalue.value AS value,
                    datavalueC.value AS comment,
                    datavalue.lastupdated AS lastupdated,
                    datavalue.storedby AS storedby,
                    organisationunit.name AS orgunit,
                    _periodstructure.iso AS period
                FROM
                    datavalue AS datavalue
                    INNER JOIN _periodstructure USING (periodid)
                    INNER JOIN dataelement AS dataelement USING (dataelementid)
                    INNER JOIN datavalue AS datavalueC ON datavalue.periodid = datavalueC.periodid
                    AND datavalue.sourceid = datavalueC.sourceid
                    AND datavalue.attributeoptioncomboid = datavalueC.attributeoptioncomboid
                    AND NOT datavalue.deleted
                    AND NOT datavalueC.deleted
                    AND dataelement.uid = ANY (
                        string_to_array(
                            regexp_replace('${commentPairs}', '_\w+', '', 'g'),
                            '-'
                        )
                    )
                    AND (
                        datavalueC.dataelementid IN (
                            SELECT
                                dataelementid
                            FROM
                                dataelement
                            WHERE
                                uid = ANY (
                                    string_to_array(
                                        regexp_replace('${commentPairs}', '\w+_', '', 'g'),
                                        '-'
                                    )
                                )
                        )
                    )
                    INNER JOIN dataelement AS dataelementC ON (
                        datavalueC.dataelementid = dataelementC.dataelementid
                        AND (
                            dataelement.uid || '_' || dataelementC.uid = ANY (string_to_array('${commentPairs}', '-'))
                        )
                    )
                    INNER JOIN categoryoptioncombo ON (
                        datavalue.categoryoptioncomboid = categoryoptioncombo.categoryoptioncomboid
                    )
                    INNER JOIN organisationunit ON (
                        organisationunit.organisationunitid = datavalue.sourceid
                    )
                    INNER JOIN datasetelement ON (
                        datavalue.dataelementid = datasetelement.dataelementid
                    )
                    INNER JOIN dataset USING (datasetid)
                WHERE
                    _periodstructure.iso ~ ('^' || replace('${periods}', '-', '|') || '$')
                    AND organisationunit.path ~ (replace('${orgUnitIds}', '-', '|'))
            ) AS unionttable
    ) as t
WHERE
    '${sectionIds}' = '-'
    OR section ~ ('^' || replace('${sectionIds}', '-', '|') || '$')
ORDER BY
    ${orderByColumn} ${orderByDirection},
    datasetname ASC,
    period ASC,
    orgunit ASC,
    dataelementorder ASC
