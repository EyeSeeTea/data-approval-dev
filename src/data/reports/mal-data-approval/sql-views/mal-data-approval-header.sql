SELECT dataset.name                                           AS dataset,
       dataset.uid                                            AS datasetuid,
       organisationunit.uid                                   AS orgunituid,
       organisationunit.name                                  AS orgunit,
       organisationunit.code                                  AS orgunitcode
       FROM dataset
                JOIN datasetsource USING (datasetid)
                JOIN organisationunit ON (organisationunitid=sourceid)
where dataset.uid    ~ ('^' || replace('${dataSets}', '-', '|') || '$')
group by dataset.uid, dataset.name, organisationunit.name, organisationunit.uid, organisationunit.code
