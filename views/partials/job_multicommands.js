          <h1 class="page-header">Job
                {{#if id}}
                <a href="/gills/job/{{id}}/delete"><button type="submit" class="btn btn-danger">Delete</button></a>
                <a href="/gills/job/{{id}}/start"><button type="submit" class="btn btn-info">Start</button></a>
                <a href="/gills/queue/{{id}}/add"><button type="submit" class="btn btn-info">Add</button></a>
                {{/if}}
          </h1>
          <h2 class="sub-header">Basic</h2>
          <form class="form-horizontal" method="post" action="{{post_url}}">
          {{#if id}}
          <div class="form-group">
            <label for="inputId" class="control-label col-xs-2">Id</label>
            <div class="col-xs-5">
                <input type="text" class="form-control" name="id" id="id" value="{{id}}" disabled>
            </div>
            <div class="offset-col-xs-5">
                <button type="button" class="btn btn-default" data-container="body" data-toggle="popover" data-placement="left" data-content="This id is used so it is easy to rename your job.">?</button>
            </div>
          </div>
          {{/if}}
          <div class="form-group">
            <label for="inputName" class="control-label col-xs-2">Name</label>
            <div class="col-xs-5">
                <input type="text" class="form-control" name="name" id="inputName" placeholder="Name" value="{{name}}">
            </div>
            <div class="offset-col-xs-5">
                <button type="button" class="btn btn-default" data-container="body" data-toggle="popover" data-placement="left" data-content="this name must be unique for link">?</button>
            </div>
          </div>
          <div class="form-group">
            <label for="inputDescription" class="control-label col-xs-2">Description</label>
            <div class="col-xs-10">
                <input type="text" class="form-control" name="description" id="inputDescription" placeholder="Description" value="{{description}}">
            </div>
          </div>
          <h2 class="sub-header">Source Control</h2>
          <div class="form-group">
            <label for="inputSCM" class="control-label col-xs-2">Type</label>
            <div class="col-xs-2">
              <div class="input-group">
                <span class="input-group-addon">
                  <input type="radio" name="scm_type" value="none">
                </span>
                <button type="button" class="btn btn-default" disabled>None</button>
             </div><!-- /input-group -->
           </div>
            <div class="col-xs-2">
              <div class="input-group">
                <span class="input-group-addon">
                  <input type="radio" name="scm_type" value="git" checked>
                </span>
                <button type="button" class="btn btn-default" disabled>Git</button>
             </div><!-- /input-group -->
           </div>
          </div>
          <div class="form-group">
            <label for="inputUrl" class="control-label col-xs-2">Url</label>
            <div class="col-xs-10">
                <input type="text" class="form-control" name="scm_url" id="inputUrl" placeholder="http://github.com/fishin/gills" value="{{scm_url}}">
            </div>
          </div>
          <div class="form-group">
            <label for="inputBranch" class="control-label col-xs-2">Branch</label>
            <div class="col-xs-10">
                <input type="text" class="form-control" name="scm_branch" id="inputBranch" placeholder="master" value="{{scm_branch}}">
            </div>
          </div>
          <h2 class="sub-header">Head</h2>
          <div class="form-group">
            <label for="inputHead" class="control-label col-xs-2">New Command</label>
            <div class="col-xs-10">
                <input type="text" class="form-control" name="head" id="inputHead" placeholder="npm install">
            </div>
          </div>
          {{#each head}} 
          <div class="form-group">
            <label for="inputHead" class="control-label col-xs-2">Command</label>
            <div class="col-xs-10">
                <input type="text" class="form-control" name="head" id="inputHead" value="{{this}}">
            </div>
          </div>
          {{/each}} 
          <h2 class="sub-header">Body</h2>
          <div class="form-group">
            <label for="inputBody" class="control-label col-xs-2">New Command</label>
            <div class="col-xs-10">
                <input type="text" class="form-control" name="body" id="inputBody" placeholder="npm test">
            </div>
          </div>
          {{#each body}} 
          <div class="form-group">
            <label for="inputBody" class="control-label col-xs-2">Command</label>
            <div class="col-xs-10">
                <input type="text" class="form-control" name="body" id="inputBody" value="{{this}}">
            </div>
          </div>
          {{/each}} 
          <h2 class="sub-header">Tail</h2>
          <div class="form-group">
            <label for="inputTail" class="control-label col-xs-2">New Command</label>
            <div class="col-xs-10">
                <input type="text" class="form-control" name="tail" id="inputTail" placeholder="bin/tail.sh">
            </div>
          </div>
          {{#each tail}} 
          <div class="form-group">
            <label for="inputTail" class="control-label col-xs-2">Command</label>
            <div class="col-xs-10">
                <input type="text" class="form-control" name="tail" id="inputTail" value="{{this}}">
            </div>
          </div>
          {{/each}} 
          <h2 class="sub-header">Notify</h2>
          <div class="form-group">
            <label for="inputNotify" class="control-label col-xs-2">Type</label>
            <div class="col-xs-2">
              <div class="input-group">
                <span class="input-group-addon">
                  <input type="radio" name="notify_type" value="none">
                </span>
                <button type="button" class="btn btn-default" disabled>None</button>
             </div><!-- /input-group -->
           </div>
            <div class="col-xs-2">
              <div class="input-group">
                <span class="input-group-addon">
                  <input type="radio" name="notify_type" value="email" checked>
                </span>
                <button type="button" class="btn btn-default" disabled>Email</button>
             </div><!-- /input-group -->
           </div>
          </div>
          <div class="form-group">
            <label for="inputTo" class="control-label col-xs-2">To</label>
            <div class="col-xs-10">
                <input type="text" class="form-control" name="notify_to" id="inputTo" placeholder="lloyd.benson@gmail.com" value="{{notify_to}}">
            </div>
          </div>
          <div class="form-group">
            <label for="inputSubject" class="control-label col-xs-2">Subject</label>
            <div class="col-xs-10">
                <input type="text" class="form-control" name="notify_subject" id="inputSubject" placeholder="[ficion] {status} for {name}" value="{{notify_subject}}">
            </div>
          </div>
          <div class="form-group">
            <label for="inputMessage" class="control-label col-xs-2">Message</label>
            <div class="col-xs-10">
                <textarea class="form-control" name="notify_message" id="inputMessage" rows=10>{{notify_message}}</textarea>
            </div>
          </div>
          <div class="form-group">
            <div class="col-xs-offset-2 col-xs-10">
                {{#if id}}
                <button type="submit" class="btn btn-primary">Update</button>
                {{else}}
                <button type="submit" class="btn btn-primary">Create</button>
                {{/if}}
            </div>
          </div>
          </form>
