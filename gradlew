#!/usr/bin/env sh

#
# Copyright 2015 the original author or authors.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

# Add default JVM options here. You can also use JAVA_OPTS and GRADLE_OPTS to pass any JVM options to this script.
DEFAULT_JVM_OPTS=""

APP_NAME="Gradle"
APP_BASE_NAME=`basename "$0"`

# Use the maximum available, or set MAX_FD != -1 to use that value.
MAX_FD="maximum"

warn () {
    echo "$*"
}

die () {
    echo
    echo "$*"
    echo
    exit 1
}

# OS specific support (must be 'true' or 'false').
cygwin=false
msys=false
darwin=false
nonstop=false
case "`uname`" in
  CYGWIN* )
    cygwin=true
    ;;
  Darwin* )
    darwin=true
    ;;
  MINGW* )
    msys=true
    ;;
  NONSTOP* )
    nonstop=true
    ;;
esac

# Attempt to set APP_HOME
# Resolve links: $0 may be a link
PRG="$0"
# Need this for relative symlinks.
while [ -h "$PRG" ] ; do
    ls=`ls -ld "$PRG"`
    link=`expr "$ls" : '.*-> \(.*\)$'`
    if expr "$link" : '/.*' > /dev/null; then
        PRG="$link"
    else
        PRG=`dirname "$PRG"`"/$link"
    fi
done

APP_HOME=`dirname "$PRG"`

# For Cygwin, ensure paths are in UNIX format before anything is touched
if $cygwin ; then
    [ -n "$APP_HOME" ] &&
        APP_HOME=`cygpath --unix "$APP_HOME"`
    [ -n "$JAVA_HOME" ] &&
        JAVA_HOME=`cygpath --unix "$JAVA_HOME"`
    [ -n "$CLASSPATH" ] &&
        CLASSPATH=`cygpath --path --unix "$CLASSPATH"`
fi

# Resolve JAVA_HOME if this script is executed directly
#-----------------------------------------------------------------------------
if [ -z "$JAVA_HOME" ] ; then
    if [ -d "/opt/java8" ] ; then
        JAVA_HOME="/opt/java8"
    elif [ -d "/usr/local/java8" ] ; then
        JAVA_HOME="/usr/local/java8"
    elif [ -d "/usr/local/sdk/java/8" ] ; then
        JAVA_HOME="/usr/local/sdk/java/8"
    fi
fi
#-----------------------------------------------------------------------------


# If a JDK is required, try to find it.
if [ -z "$JAVA_HOME" -a -x "/usr/libexec/java_home" ] ; then
    JAVA_HOME=`/usr/libexec/java_home`
fi

# We need to find a usable JRE...
if [ -z "$JAVA_HOME" -o ! -d "$JAVA_HOME" ] ; then
    # If we have a java executable in path, we should be okay.
    which java > /dev/null 2>&1
    if [ $? -ne 0 ] ; then
        die "ERROR: JAVA_HOME is not set and no 'java' command could be found in your PATH.

Please set the JAVA_HOME variable in your environment to match the
location of your Java installation."
    fi
    JAVA_CMD="java"
else
    JAVA_CMD="$JAVA_HOME/bin/java"
fi

if [ ! -x "$JAVA_CMD" ] ; then
    die "ERROR: JAVA_HOME is set to an invalid directory: $JAVA_HOME

Please set the JAVA_HOME variable in your environment to match the
location of your Java installation."
fi

# Increase the maximum file descriptors if we can.
if ! $cygwin && ! $msys && ! $nonstop ; then
    MAX_FD_LIMIT=`ulimit -H -n`
    if [ $? -eq 0 ] ; then
        if [ "$MAX_FD" = "maximum" -o "$MAX_FD" = "max" ] ; then
            # Use the system limit
            MAX_FD="$MAX_FD_LIMIT"
        fi
        ulimit -n $MAX_FD
        if [ $? -ne 0 ] ; then
            warn "Could not set maximum file descriptor limit: $MAX_FD"
        fi
    else
        warn "Could not query maximum file descriptor limit: $MAX_FD_LIMIT"
    fi
fi

# Add application jars to CLASSPATH
#-----------------------------------------------------------------------------
CLASSPATH="$APP_HOME/gradle/wrapper/gradle-wrapper.jar"
#-----------------------------------------------------------------------------

# Split up the JVM options passed in by the user.
# This allows us to add quotes around each of the options, which is required when they contain spaces.
# The options are collected into the OPTS array, with each element being a single option.
#
# This parsing is not advanced enough to support options which contain an escaped quote.
# The parsing is also not advanced enough to support options which are quoted and contain a space.
#
# For example, the following does not work:
#   -Dmy.prop="foo bar"
#
# It is recommended to instead use a properties file or environment variables to supply such values.
#
# An alternative approach is to use an array to define the options, as this will not be split.
# For example:
#   OPTS=("-Dmy.prop=foo bar" "-Dmy.prop2=hello world")
#
# If the OPTS array is not defined, then the following logic is used to parse the string.
if [ -z "$OPTS" ] ; then
    OPTS=
    if [ -n "$JAVA_OPTS" ] ; then
        # Add the JAVA_OPTS to the OPTS array.
        # We are unable to handle spaces in options, so we are splitting on spaces.
        # The user can use an array to define the options, which will not be split.
        JAVA_OPTS_ARRAY=($JAVA_OPTS)
        for opt in "${JAVA_OPTS_ARRAY[@]}" ; do
            OPTS="$OPTS \"$opt\""
        done
    fi
    if [ -n "$GRADLE_OPTS" ] ; then
        # Add the GRADLE_OPTS to the OPTS array.
        # We are unable to handle spaces in options, so we are splitting on spaces.
        # The user can use an array to define the options, which will not be split.
        GRADLE_OPTS_ARRAY=($GRADLE_OPTS)
        for opt in "${GRADLE_OPTS_ARRAY[@]}" ; do
            OPTS="$OPTS \"$opt\""
        done
    fi
fi

# Add the default JVM options to the OPTS array.
if [ -n "$DEFAULT_JVM_OPTS" ] ; then
    # We are unable to handle spaces in options, so we are splitting on spaces.
    # The user can use an array to define the options, which will not be split.
    DEFAULT_JVM_OPTS_ARRAY=($DEFAULT_JVM_OPTS)
    for opt in "${DEFAULT_JVM_OPTS_ARRAY[@]}" ; do
        OPTS="$OPTS \"$opt\""
    done
fi

# Collect all arguments for the java command, following the shell quoting rules.
#
# It is important to note that this is not a perfect solution, as it does not handle all cases.
# For example, it does not handle the case where an argument contains a quote.
#
# However, it is a good enough solution for the majority of cases.
#
# The arguments are collected into the ALL_OPTS array, with each element being a single argument.
#
# The arguments are then joined together with spaces, with each argument being quoted.
# This is to ensure that arguments with spaces are handled correctly.
ALL_OPTS=
for opt in $OPTS ; do
    ALL_OPTS="$ALL_OPTS \"$opt\""
done

# Start the application
#
# The OPTS array is passed to the java command as a list of arguments.
# This is to ensure that options with spaces are handled correctly.
#
# The "$@" is used to pass all the arguments to the application.
# This is to ensure that arguments with spaces are handled correctly.
#
# The exec command is used to replace the current process with the java command.
# This is to ensure that the java command is the only process running.
#
# The OPTS array is not quoted, as it is passed as a list of arguments.
# The "$@" is quoted, as it is passed as a list of arguments.
exec "$JAVA_CMD" $ALL_OPTS -classpath "$CLASSPATH" org.gradle.wrapper.GradleWrapperMain "$@"