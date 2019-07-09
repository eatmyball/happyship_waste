/*
       Licensed to the Apache Software Foundation (ASF) under one
       or more contributor license agreements.  See the NOTICE file
       distributed with this work for additional information
       regarding copyright ownership.  The ASF licenses this file
       to you under the Apache License, Version 2.0 (the
       "License"); you may not use this file except in compliance
       with the License.  You may obtain a copy of the License at
         http://www.apache.org/licenses/LICENSE-2.0
       Unless required by applicable law or agreed to in writing,
       software distributed under the License is distributed on an
       "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
       KIND, either express or implied.  See the License for the
       specific language governing permissions and limitations
       under the License.
 */

package com.wisebox.happyship.mwts;


import android.os.Bundle;
import org.apache.cordova.*;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.support.v4.content.LocalBroadcastManager;
import android.util.Log;


public class MainActivity extends CordovaActivity
{
    @Override
    public void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);

        // enable Cordova apps to be started in the background
        Bundle extras = getIntent().getExtras();
        if (extras != null && extras.getBoolean("cdvStartInBackground", false)) {
            moveTaskToBack(true);
        }

        // Set by <content src="index.html" /> in config.xml
        loadUrl(launchUrl);
        onJSMessage();
    }

    void onJSMessage() {

        final BroadcastReceiver receiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                    final Bundle extras = intent.getExtras();


                    Log.d("CDVBroadcaster",
                            String.format("Native event [%s] received with data [%s]", intent.getAction(), String.valueOf(extras)));
                    
                    sendJSMessage(extras);
            }
        };

        //LocalBroadcastManager.getInstance(this).registerReceiver(receiver, new IntentFilter("android.intent.action.SCREEN_OFF"));
        registerReceiver(receiver, new IntentFilter("com.scanner.broadcast"));
        //registerReceiver(receiver, new IntentFilter("android.intent.action.SCREEN_OFF"));

    }
    void sendJSMessage(Bundle data) {
        final Intent intent = new Intent("com.wisebox.happyship.mwts.broadcast");

        // Bundle b = new Bundle();
        // b.putString( "data", );
        // b.putBoolean( "valid", true );
        intent.putExtras(data);

        LocalBroadcastManager.getInstance(this).sendBroadcastSync(intent);
    }}