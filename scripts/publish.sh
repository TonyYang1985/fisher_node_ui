if [ -z "$npm_config__auth" ];  
then  
    echo "Environment Variable 'npm_config__auth' is not set. see doc: https://help.sonatype.com/repomanager3/formats/npm-registry#npmRegistry-AuthenticationUsingBasicAuth"  
else
    yarn version && \
    rm -rf release  && \
    mkdir -p release && \
    node scripts/savePackage.js > release/package.json && \
    yarn gen:idx && \
    yarn tsc --outDir temp --declaration true --noEmit false && \
    yarn rollup -c && \
    cp .npmrc release/  && \
    cp .yarnrc release/  && \
    cd release 
fi  



